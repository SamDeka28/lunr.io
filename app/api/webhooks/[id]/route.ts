import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WebhookService } from "@/lib/services/webhook.service";
import { PlanService } from "@/lib/services/plan.service";

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

    // Check if user has API access
    const planService = new PlanService(supabase);
    const hasApiAccess = await planService.hasFeature(user.id, "api_access");
    
    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access is required. Upgrade to Enterprise plan." },
        { status: 403 }
      );
    }

    const webhookService = new WebhookService(supabase);
    const webhook = await webhookService.getWebhook(id, user.id);

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Don't expose secret
    const { secret, ...sanitized } = webhook;

    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhook" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Check if user has API access
    const planService = new PlanService(supabase);
    const hasApiAccess = await planService.hasFeature(user.id, "api_access");
    
    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access is required. Upgrade to Enterprise plan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = body.events;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const webhookService = new WebhookService(supabase);
    const webhook = await webhookService.updateWebhook(id, user.id, updates);

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Don't expose secret
    const { secret, ...sanitized } = webhook;

    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update webhook" },
      { status: 400 }
    );
  }
}

export async function DELETE(
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

    // Check if user has API access
    const planService = new PlanService(supabase);
    const hasApiAccess = await planService.hasFeature(user.id, "api_access");
    
    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access is required. Upgrade to Enterprise plan." },
        { status: 403 }
      );
    }

    const webhookService = new WebhookService(supabase);
    await webhookService.deleteWebhook(id, user.id);

    return NextResponse.json({ message: "Webhook deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete webhook" },
      { status: 500 }
    );
  }
}

