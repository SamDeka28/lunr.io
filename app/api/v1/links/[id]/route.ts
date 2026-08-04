import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { LinkService } from "@/lib/services/link.service";
import { createServiceClient } from "@/lib/supabase/admin";

// GET /api/v1/links/[id] - Get a specific link
async function handleGet(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceSupabase = createServiceClient();
    const userId = request.apiKey!.user_id;

    // Verify ownership and get link with QR codes
    const { data: link, error } = await serviceSupabase
      .from("links")
      .select("*, qr_codes(id, qr_data, created_at, is_active)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    const baseUrl = request.headers.get("origin") || request.nextUrl.origin;

    // Get the most recent active QR code
    const qrCodes = (link.qr_codes || []).filter((qr: any) => qr.is_active);
    const qrCode = qrCodes.length > 0 ? qrCodes[0] : null;

    return NextResponse.json({
      id: link.id,
      short_code: link.short_code,
      short_url: `${baseUrl}/${link.short_code}`,
      original_url: link.original_url,
      title: link.title,
      click_count: link.click_count,
      created_at: link.created_at,
      expires_at: link.expires_at,
      is_active: link.is_active,
      utm_parameters: link.utm_parameters,
      campaign_id: link.campaign_id,
      qr_code: qrCode ? {
        id: qrCode.id,
        qr_data: qrCode.qr_data,
        created_at: qrCode.created_at,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch link" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/links/[id] - Update a link
async function handlePatch(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceSupabase = createServiceClient();
    const userId = request.apiKey!.user_id;
    const body = await request.json();

    // Verify ownership
    const { data: existingLink } = await serviceSupabase
      .from("links")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingLink) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.expires_at !== undefined) updates.expires_at = body.expires_at;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.utm_parameters !== undefined) updates.utm_parameters = body.utm_parameters;
    if (body.campaign_id !== undefined) updates.campaign_id = body.campaign_id;
    if (body.original_url !== undefined) {
      const { validateURL } = await import("@/lib/utils/urlValidator");
      const validation = validateURL(body.original_url);
      if (!validation.isValid || !validation.normalizedUrl) {
        return NextResponse.json(
          { error: validation.error || "Invalid URL" },
          { status: 400 }
        );
      }
      updates.original_url = validation.normalizedUrl;
    }
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : [];
    }
    if (body.folder !== undefined) updates.folder = body.folder?.trim() || null;
    if (body.max_clicks !== undefined) {
      updates.max_clicks =
        body.max_clicks != null && body.max_clicks !== ""
          ? Number(body.max_clicks)
          : null;
    }
    if (body.targeting !== undefined) updates.targeting = body.targeting || {};

    if (body.short_code !== undefined && body.short_code) {
      const {
        normalizeShortCode,
        isValidShortCode,
        getShortCodeContentError,
      } = await import("@/lib/utils/shortCodeGenerator");
      const normalized = normalizeShortCode(String(body.short_code));
      if (!isValidShortCode(normalized)) {
        return NextResponse.json({ error: "Invalid short code format" }, { status: 400 });
      }
      const contentError = getShortCodeContentError(normalized);
      if (contentError) {
        return NextResponse.json({ error: contentError }, { status: 400 });
      }
      const { data: clash } = await serviceSupabase
        .from("links")
        .select("id")
        .eq("short_code", normalized)
        .neq("id", id)
        .limit(1)
        .maybeSingle();
      if (clash) {
        return NextResponse.json({ error: "Short code already exists" }, { status: 400 });
      }
      updates.short_code = normalized;
    }

    const { data: link, error } = await serviceSupabase
      .from("links")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update link" },
        { status: 400 }
      );
    }

    // Trigger webhook for link.updated
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(serviceSupabase);
      await webhookService.triggerWebhooks(userId, "link.updated", link);
    } catch (error) {
      console.error("Failed to trigger webhook for link.updated:", error);
      // Don't fail the request if webhook fails
    }

    const baseUrl = request.headers.get("origin") || request.nextUrl.origin;

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
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/links/[id] - Delete a link
async function handleDelete(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceSupabase = createServiceClient();
    const userId = request.apiKey!.user_id;

    // Verify ownership and get link data before deletion
    const { data: existingLink } = await serviceSupabase
      .from("links")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingLink) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    const linkService = new LinkService(serviceSupabase);
    await linkService.deleteLink(id);

    // Trigger webhook for link.deleted
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(serviceSupabase);
      await webhookService.triggerWebhooks(userId, "link.deleted", existingLink);
    } catch (error) {
      console.error("Failed to trigger webhook for link.deleted:", error);
      // Don't fail the request if webhook fails
    }

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete link" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const PATCH = withApiAuth(handlePatch);
export const DELETE = withApiAuth(handleDelete);
