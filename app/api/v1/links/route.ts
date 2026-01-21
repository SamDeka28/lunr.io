import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { LinkService } from "@/lib/services/link.service";
import { PlanService } from "@/lib/services/plan.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/links - List all links for the authenticated API user
async function handleGet(request: AuthenticatedApiRequest) {
  try {
    // Use service role client to bypass RLS for API key authentication
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    const userId = request.apiKey!.user_id;

    const linkService = new LinkService(serviceSupabase);
    const { data: links } = await serviceSupabase
      .from("links")
      .select("id, short_code, original_url, title, click_count, created_at, expires_at, is_active, qr_codes(id, qr_data, created_at, is_active)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const baseUrl = request.headers.get("origin") || request.nextUrl.origin;

    const formattedLinks = (links || []).map((link) => {
      // Get the most recent active QR code
      const qrCodes = (link.qr_codes || []).filter((qr: any) => qr.is_active);
      const qrCode = qrCodes.length > 0 ? qrCodes[0] : null;

      return {
        id: link.id,
        short_code: link.short_code,
        short_url: `${baseUrl}/${link.short_code}`,
        original_url: link.original_url,
        title: link.title,
        click_count: link.click_count,
        created_at: link.created_at,
        expires_at: link.expires_at,
        is_active: link.is_active,
        qr_code: qrCode ? {
          id: qrCode.id,
          qr_data: qrCode.qr_data,
          created_at: qrCode.created_at,
        } : null,
      };
    });

    return NextResponse.json({
      links: formattedLinks,
      count: formattedLinks.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/v1/links - Create a new link
async function handlePost(request: AuthenticatedApiRequest) {
  try {
    const userId = request.apiKey!.user_id;
    const body = await request.json();
    const { original_url, short_code, expires_at, title, utm_parameters, campaign_id } = body;

    if (!original_url) {
      return NextResponse.json(
        { error: "original_url is required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS for API key authentication
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Validate against plan limits
    const planService = new PlanService(serviceSupabase);
    const validation = await planService.validateLinkCreation(userId, {
      short_code,
      expires_at,
      password: null, // API doesn't support password
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const linkService = new LinkService(serviceSupabase);
    const link = await linkService.createLink({
      original_url,
      short_code,
      title: title || null,
      expires_at: expires_at || null,
      password: null,
      user_id: userId,
      utm_parameters: utm_parameters || null,
      campaign_id: campaign_id || null,
    });

    // Trigger webhook for link.created
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(serviceSupabase);
      await webhookService.triggerWebhooks(userId, "link.created", link);
    } catch (error) {
      console.error("Failed to trigger webhook for link.created:", error);
      // Don't fail the request if webhook fails
    }

    const baseUrl = request.headers.get("origin") || request.nextUrl.origin;
    const shortUrl = `${baseUrl}/${link.short_code}`;

    // Check if link has a QR code
    const { data: qrCodes } = await serviceSupabase
      .from("qr_codes")
      .select("id, qr_data, created_at")
      .eq("link_id", link.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    const qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null;

    return NextResponse.json({
      id: link.id,
      short_code: link.short_code,
      short_url: shortUrl,
      original_url: link.original_url,
      title: link.title,
      click_count: link.click_count,
      created_at: link.created_at,
      expires_at: link.expires_at,
      qr_code: qrCode ? {
        id: qrCode.id,
        qr_data: qrCode.qr_data,
        created_at: qrCode.created_at,
      } : null,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create link" },
      { status: 400 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const POST = withApiAuth(handlePost);

