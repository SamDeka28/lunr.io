import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WebhookService } from "@/lib/services/webhook.service";
import { PlanService } from "@/lib/services/plan.service";

export async function GET(request: NextRequest) {
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
    const webhooks = await webhookService.getUserWebhooks(user.id);

    // Don't expose secret in list view
    const sanitized = webhooks.map(({ secret, ...rest }) => rest);

    return NextResponse.json({ webhooks: sanitized });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
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
    const { name, url, events } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Webhook name is required" },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Webhook URL is required" },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "At least one event type is required" },
        { status: 400 }
      );
    }

    const webhookService = new WebhookService(supabase);
    const webhook = await webhookService.createWebhook({
      user_id: user.id,
      name: name.trim(),
      url: url.trim(),
      events,
    });

    // Return webhook with secret (only shown once)
    return NextResponse.json({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      is_active: webhook.is_active,
      created_at: webhook.created_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create webhook" },
      { status: 400 }
    );
  }
}

