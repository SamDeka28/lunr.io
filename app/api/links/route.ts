// API Route for Link Creation
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkService } from "@/lib/services/link.service";
import { PlanService } from "@/lib/services/plan.service";

function getBaseUrl(request: NextRequest): string {
  const origin = request.headers.get("origin") || request.nextUrl.origin;
  return origin;
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

    const body = await request.json();
    const { original_url, short_code, expires_at, password, title, utm_parameters, campaign_id } = body;

    if (!original_url) {
      return NextResponse.json(
        { error: "original_url is required" },
        { status: 400 }
      );
    }

    // Validate against plan limits and features
    const planService = new PlanService(supabase);
    const validation = await planService.validateLinkCreation(user.id, {
      short_code,
      expires_at,
      password,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const linkService = new LinkService(supabase);
    const link = await linkService.createLink({
      original_url,
      short_code,
      title: title || null,
      expires_at,
      password,
      user_id: user.id,
      utm_parameters: utm_parameters || null,
      campaign_id: campaign_id || null,
    });

    // Trigger webhook for link.created
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(supabase);
      await webhookService.triggerWebhooks(user.id, "link.created", link);
    } catch (error) {
      console.error("Failed to trigger webhook for link.created:", error);
      // Don't fail the request if webhook fails
    }

    const baseUrl = getBaseUrl(request);
    const shortUrl = `${baseUrl}/${link.short_code}`;

    return NextResponse.json({
      id: link.id,
      short_code: link.short_code,
      original_url: link.original_url,
      short_url: shortUrl,
      created_at: link.created_at,
      expires_at: link.expires_at,
      click_count: link.click_count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create link" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shortCode = searchParams.get("short_code");
    const all = searchParams.get("all") === "true";

    // If "all=true" is requested, return all user links
    if (all) {
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

      const { data: links, error } = await supabase
        .from("links")
        .select("id, short_code, original_url, title, click_count, campaign_id, created_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ links: links || [] });
    }

    // Otherwise, get link by short_code
    if (!shortCode) {
      return NextResponse.json(
        { error: "short_code parameter is required" },
        { status: 400 }
      );
    }

    const linkService = new LinkService();
    const link = await linkService.getLinkByShortCode(shortCode);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    const baseUrl = getBaseUrl(request);
    const shortUrl = `${baseUrl}/${link.short_code}`;

    return NextResponse.json({
      id: link.id,
      short_code: link.short_code,
      original_url: link.original_url,
      short_url: shortUrl,
      created_at: link.created_at,
      expires_at: link.expires_at,
      click_count: link.click_count,
      is_active: link.is_active,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get link" },
      { status: 500 }
    );
  }
}

