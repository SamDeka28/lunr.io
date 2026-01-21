import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";
import QRCode from "qrcode";

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

    // Check user limits using PlanService
    const planService = new PlanService(supabase);
    if (!(await planService.canCreateQR(user.id))) {
      const limits = await planService.getUsageLimits(user.id);
      return NextResponse.json(
        { error: `You've reached your limit of ${limits.max_qr_codes} QR codes. Upgrade to create more.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { link_id, url } = body;

    if (!link_id && !url) {
      return NextResponse.json(
        { error: "link_id or url is required" },
        { status: 400 }
      );
    }

    // Generate QR code
    let qrUrl = url;
    if (link_id && !url) {
      // Only fetch link's original_url if no custom url is provided
      const { data: link } = await supabase
        .from("links")
        .select("original_url")
        .eq("id", link_id)
        .eq("user_id", user.id)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Link not found" },
          { status: 404 }
        );
      }

      qrUrl = link.original_url;
    } else if (link_id && url) {
      // If both link_id and url are provided, verify link exists and use the provided url
      // This allows creating QR codes for shortened links that point to the short URL
      const { data: link } = await supabase
        .from("links")
        .select("id")
        .eq("id", link_id)
        .eq("user_id", user.id)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Link not found" },
          { status: 404 }
        );
      }

      // Use the provided url (e.g., short URL)
      qrUrl = url;
    }

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
    });

    // Save QR code
    const { data: qrCode, error: insertError } = await supabase
      .from("qr_codes")
      .insert({
        user_id: user.id,
        link_id: link_id || null,
        qr_data: qrDataUrl,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(qrCode);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

