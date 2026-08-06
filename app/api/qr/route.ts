import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";
import { LinkService } from "@/lib/services/link.service";
import QRCode from "qrcode";

const SIZE_MAP: Record<string, number> = {
  small: 200,
  medium: 300,
  large: 500,
};

function getBaseUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    request.nextUrl.origin
  ).replace(/\/$/, "");
}

/** Append utm_medium=qr (and utm_source=qr if missing) for attribution */
function withQrUtm(shortUrl: string): string {
  try {
    const url = new URL(shortUrl);
    if (!url.searchParams.has("utm_medium")) {
      url.searchParams.set("utm_medium", "qr");
    }
    if (!url.searchParams.has("utm_source")) {
      url.searchParams.set("utm_source", "qr");
    }
    return url.toString();
  } catch {
    const sep = shortUrl.includes("?") ? "&" : "?";
    return `${shortUrl}${sep}utm_medium=qr&utm_source=qr`;
  }
}

async function generateQRDataUrl(
  targetUrl: string,
  options: {
    width: number;
    dark: string;
    light: string;
    logoDataUrl?: string | null;
  }
): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: options.width,
    margin: 2,
    errorCorrectionLevel: options.logoDataUrl ? "H" : "M",
    color: {
      dark: options.dark,
      light: options.light,
    },
  });

  if (!options.logoDataUrl) {
    return qrDataUrl;
  }

  // Server-side logo compositing via canvas is not available in Node without
  // extra deps. Persist the base QR with colors; logo is applied client-side
  // for download/preview. If a precomposed data URL is provided as qr_data
  // override, callers can pass it separately.
  return qrDataUrl;
}

async function generateQRSvg(
  targetUrl: string,
  options: { width: number; dark: string; light: string }
): Promise<string> {
  return QRCode.toString(targetUrl, {
    type: "svg",
    width: options.width,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: options.dark,
      light: options.light,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const planService = new PlanService(supabase);
    if (!(await planService.canCreateQR(user.id))) {
      const limits = await planService.getUsageLimits(user.id);
      return NextResponse.json(
        {
          error: `You've reached your limit of ${limits.max_qr_codes} QR codes. Upgrade to create more.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      link_id,
      url,
      title,
      description,
      fg_color = "#000000",
      bg_color = "#FFFFFF",
      size = "medium",
      logo_data_url,
      qr_data: precomposedQrData,
      format = "png",
    } = body;

    if (!link_id && !url) {
      return NextResponse.json(
        { error: "link_id or url is required" },
        { status: 400 }
      );
    }

    const qrFormat = format === "svg" ? "svg" : "png";
    const baseUrl = getBaseUrl(request);
    let resolvedLinkId: string | null = link_id || null;
    let shortUrl: string;

    if (link_id) {
      // Always encode the short URL so scans hit the redirect and track clicks
      const { data: link } = await supabase
        .from("links")
        .select("id, short_code")
        .eq("id", link_id)
        .eq("user_id", user.id)
        .single();

      if (!link) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }

      shortUrl = `${baseUrl}/${link.short_code}`;
    } else {
      // Standalone URL: auto-create a short link so scans are trackable
      if (!(await planService.canCreateLink(user.id))) {
        const limits = await planService.getUsageLimits(user.id);
        return NextResponse.json(
          {
            error: `Creating a trackable QR requires a short link, but you've reached your limit of ${limits.max_links} links. Upgrade to create more.`,
          },
          { status: 403 }
        );
      }

      const linkService = new LinkService(supabase);
      const link = await linkService.createLink({
        original_url: url,
        user_id: user.id,
      });

      resolvedLinkId = link.id;
      shortUrl = `${baseUrl}/${link.short_code}`;
    }

    const encodedUrl = withQrUtm(shortUrl);

    const width = SIZE_MAP[size] || SIZE_MAP.medium;
    const isPremium = await planService.hasFeature(user.id, "qr_customization")
      || (await planService.getUserPlan(user.id))?.plan?.name !== "free";

    const dark = isPremium ? fg_color : "#000000";
    const light = isPremium ? bg_color : "#FFFFFF";
    const finalWidth = isPremium ? width : 300;

    let qrData: string;
    let svgData: string | null = null;

    if (qrFormat === "svg") {
      svgData = await generateQRSvg(encodedUrl, {
        width: finalWidth,
        dark,
        light,
      });
      // Store as data URL so existing download/preview UIs still work
      qrData = `data:image/svg+xml;base64,${Buffer.from(svgData).toString("base64")}`;
    } else if (
      typeof precomposedQrData === "string" &&
      precomposedQrData.startsWith("data:image")
    ) {
      // Prefer a client-precomposed image (includes logo) when provided.
      // Note: client should encode with utm_medium=qr for attribution.
      qrData = precomposedQrData;
    } else {
      qrData = await generateQRDataUrl(encodedUrl, {
        width: finalWidth,
        dark,
        light,
        logoDataUrl: isPremium ? logo_data_url : null,
      });
    }

    const trimmedTitle =
      typeof title === "string" && title.trim() ? title.trim().slice(0, 255) : null;
    const trimmedDescription =
      typeof description === "string" && description.trim()
        ? description.trim().slice(0, 2000)
        : null;

    const { data: qrCode, error: insertError } = await supabase
      .from("qr_codes")
      .insert({
        user_id: user.id,
        link_id: resolvedLinkId,
        title: trimmedTitle,
        description: trimmedDescription,
        qr_data: qrData,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...qrCode,
      short_url: encodedUrl,
      format: qrFormat,
      ...(svgData ? { svg: svgData } : {}),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
