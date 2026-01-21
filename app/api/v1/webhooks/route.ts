import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { WebhookService } from "@/lib/services/webhook.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/webhooks - List all webhooks for the authenticated API user
async function handleGet(request: AuthenticatedApiRequest) {
  try {
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    const webhookService = new WebhookService(supabase);
    const webhooks = await webhookService.getUserWebhooks(userId);

    // Don't expose secret in list view
    const sanitized = webhooks.map(({ secret, ...rest }) => rest);

    return NextResponse.json({
      webhooks: sanitized,
      count: sanitized.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/v1/webhooks - Create a new webhook
async function handlePost(request: AuthenticatedApiRequest) {
  try {
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;
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
      user_id: userId,
      name: name.trim(),
      url: url.trim(),
      events,
    });

    // Return webhook with secret (only shown once)
    return NextResponse.json(
      {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        is_active: webhook.is_active,
        created_at: webhook.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create webhook" },
      { status: 400 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const POST = withApiAuth(handlePost);

