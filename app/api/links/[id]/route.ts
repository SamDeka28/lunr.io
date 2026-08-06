// API Route for Link Management by ID
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkService } from "@/lib/services/link.service";

function sanitizeLink(link: any) {
  if (!link) return link;
  const { password_hash, ...rest } = link;
  return {
    ...rest,
    has_password: !!password_hash,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const linkService = new LinkService(supabase);
    const link = await linkService.getLinkById(id);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (link.user_id && link.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(sanitizeLink(link));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get link" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
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

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const { data: link } = await supabase
      .from("links")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (link.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate URL if provided
    if (body.original_url) {
      const { validateURL } = await import("@/lib/utils/urlValidator");
      const validation = validateURL(body.original_url);
      if (!validation.isValid || !validation.normalizedUrl) {
        return NextResponse.json(
          { error: validation.error || "Invalid URL" },
          { status: 400 }
        );
      }
      body.original_url = validation.normalizedUrl;
    }

    // Validate / normalize short_code update
    if (body.short_code !== undefined && body.short_code !== null && body.short_code !== "") {
      const {
        normalizeShortCode,
        isValidShortCode,
        getShortCodeContentError,
      } = await import("@/lib/utils/shortCodeGenerator");
      const { PlanService } = await import("@/lib/services/plan.service");
      const planService = new PlanService(supabase);

      if (!(await planService.canUseCustomBackHalf(user.id))) {
        return NextResponse.json(
          { error: "Custom back-half is a premium feature. Upgrade to change short codes." },
          { status: 403 }
        );
      }

      const normalized = normalizeShortCode(String(body.short_code));
      if (!isValidShortCode(normalized)) {
        return NextResponse.json(
          { error: "Invalid short code format (2–20 chars, alphanumeric, hyphens, underscores)" },
          { status: 400 }
        );
      }
      const contentError = getShortCodeContentError(normalized);
      if (contentError) {
        return NextResponse.json({ error: contentError }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("links")
        .select("id")
        .eq("short_code", normalized)
        .neq("id", id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "Short code already exists" },
          { status: 400 }
        );
      }

      body.short_code = normalized;
    }

    // Validate plan features if updating premium features
    if (body.expires_at !== undefined) {
      const { PlanService } = await import("@/lib/services/plan.service");
      const planService = new PlanService(supabase);
      
      if (body.expires_at && !(await planService.canSetExpiration(user.id))) {
        return NextResponse.json(
          { error: "Link expiration is a premium feature. Upgrade to set expiration dates." },
          { status: 403 }
        );
      }
    }

    // Validate UTM parameters if provided
    if (body.utm_parameters !== undefined) {
      const { PlanService } = await import("@/lib/services/plan.service");
      const planService = new PlanService(supabase);
      
      if (body.utm_parameters && !(await planService.canUseUTMParameters(user.id))) {
        return NextResponse.json(
          { error: "UTM parameters are a premium feature. Upgrade to add UTM parameters." },
          { status: 403 }
        );
      }
    }

    // Handle password update (hash if provided)
    let passwordHash = null;
    if (body.password !== undefined) {
      if (body.password) {
        const { PlanService } = await import("@/lib/services/plan.service");
        const planService = new PlanService(supabase);
        if (!(await planService.canUsePasswordProtection(user.id))) {
          return NextResponse.json(
            { error: "Password protection is a premium feature. Upgrade to protect links with a password." },
            { status: 403 }
          );
        }
        const { hashPassword } = await import("@/lib/utils/password");
        passwordHash = hashPassword(body.password);
      } else {
        // Empty string means remove password
        passwordHash = null;
      }
    }

    // Fetch current link for UTM merge when assigning a campaign
    const { data: currentLink } = await supabase
      .from("links")
      .select("campaign_id, utm_parameters")
      .eq("id", id)
      .single();

    // Update link — only include fields that were explicitly provided
    const updateData: Record<string, unknown> = {};

    if (body.original_url !== undefined) {
      updateData.original_url = body.original_url;
    }
    if (body.expires_at !== undefined) {
      updateData.expires_at = body.expires_at || null;
    }
    if (body.title !== undefined) {
      updateData.title = body.title || null;
    }
    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }
    if (body.og_image_url !== undefined) {
      updateData.og_image_url = body.og_image_url || null;
    }
    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active);
    }
    if (body.short_code) {
      updateData.short_code = body.short_code;
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags)
        ? body.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    }
    if (body.folder !== undefined) {
      updateData.folder =
        typeof body.folder === "string" ? body.folder.trim() || null : null;
    }
    if (body.max_clicks !== undefined) {
      updateData.max_clicks =
        body.max_clicks != null && body.max_clicks !== ""
          ? Number(body.max_clicks)
          : null;
    }
    if (body.targeting !== undefined) {
      updateData.targeting = body.targeting || {};
    }

    if (body.password !== undefined) {
      updateData.password_hash = passwordHash;
    }

    if (body.lead_capture_enabled !== undefined) {
      if (body.lead_capture_enabled) {
        const { PlanService } = await import("@/lib/services/plan.service");
        const planService = new PlanService(supabase);
        if (!(await planService.canUseLeadCapture(user.id))) {
          return NextResponse.json(
            {
              error:
                "Lead capture is a premium feature. Upgrade to collect emails before redirect.",
            },
            { status: 403 }
          );
        }
      }
      updateData.lead_capture_enabled = Boolean(body.lead_capture_enabled);
    }
    if (body.lead_capture_config !== undefined) {
      const { normalizeLeadCaptureConfig } = await import(
        "@/lib/utils/lead-capture-config"
      );
      updateData.lead_capture_config = body.lead_capture_enabled
        ? normalizeLeadCaptureConfig(body.lead_capture_config)
        : body.lead_capture_config || {};
    }

    if (body.campaign_id !== undefined) {
      updateData.campaign_id = body.campaign_id || null;
    }

    // Merge campaign UTM defaults when assigning/updating campaign or UTMs
    const nextCampaignId =
      body.campaign_id !== undefined
        ? body.campaign_id || null
        : currentLink?.campaign_id || null;
    const campaignChanged =
      body.campaign_id !== undefined &&
      body.campaign_id !== currentLink?.campaign_id;

    if (
      body.utm_parameters !== undefined ||
      (campaignChanged && nextCampaignId)
    ) {
      const linkService = new LinkService(supabase);
      updateData.utm_parameters = await linkService.mergeUtmForCampaignAssignment(
        nextCampaignId,
        (currentLink?.utm_parameters as Record<string, string>) || null,
        body.utm_parameters !== undefined ? body.utm_parameters : undefined
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: updatedLink, error: updateError } = await supabase
      .from("links")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Trigger webhook for link.updated
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(supabase);
      await webhookService.triggerWebhooks(user.id, "link.updated", updatedLink);
    } catch (error) {
      console.error("Failed to trigger webhook for link.updated:", error);
      // Don't fail the request if webhook fails
    }

    return NextResponse.json(updatedLink);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
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

    const { id } = await params;
    
    // Verify ownership
    const { data: link } = await supabase
      .from("links")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    if (link.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get link data before deletion for webhook
    const { data: linkData } = await supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single();

    const linkService = new LinkService(supabase);
    await linkService.deleteLink(id);

    // Trigger webhook for link.deleted
    if (linkData) {
      try {
        const { WebhookService } = await import("@/lib/services/webhook.service");
        const webhookService = new WebhookService(supabase);
        await webhookService.triggerWebhooks(user.id, "link.deleted", linkData);
      } catch (error) {
        console.error("Failed to trigger webhook for link.deleted:", error);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete link" },
      { status: 500 }
    );
  }
}

