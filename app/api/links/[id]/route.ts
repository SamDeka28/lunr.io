// API Route for Link Management by ID
import { NextRequest, NextResponse } from "next/server";
import { LinkService } from "@/lib/services/link.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const linkService = new LinkService();
    const link = await linkService.getLinkById(id);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(link);
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
        // Hash the password
        const { LinkRepository } = await import("@/lib/db/repositories/link.repository");
        const linkRepo = new LinkRepository(supabase);
        // Access private method via type assertion (not ideal but works)
        const encoder = new TextEncoder();
        const data = encoder.encode(body.password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      } else {
        // Empty string means remove password
        passwordHash = null;
      }
    }

    // Update link
    const updateData: any = {
      original_url: body.original_url,
      expires_at: body.expires_at || null,
      title: body.title || null,
    };

    if (body.password !== undefined) {
      updateData.password_hash = passwordHash;
    }

    if (body.campaign_id !== undefined) {
      updateData.campaign_id = body.campaign_id || null;
    }

    if (body.utm_parameters !== undefined) {
      updateData.utm_parameters = body.utm_parameters || null;
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

