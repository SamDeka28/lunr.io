import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { WebhookService } from "@/lib/services/webhook.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/webhooks/[id] - Get a specific webhook
async function handleGet(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    const webhookService = new WebhookService(supabase);
    const webhook = await webhookService.getWebhook(id, userId);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Don't expose secret in GET requests
    const { secret, ...sanitized } = webhook;

    return NextResponse.json(sanitized);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhook" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/webhooks/[id] - Update a webhook
async function handlePatch(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;
    const body = await request.json();

    const webhookService = new WebhookService(supabase);
    
    // Verify ownership
    const existingWebhook = await webhookService.getWebhook(id, userId);
    if (!existingWebhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = body.events;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const webhook = await webhookService.updateWebhook(id, updates);

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

// DELETE /api/v1/webhooks/[id] - Delete a webhook
async function handleDelete(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    const webhookService = new WebhookService(supabase);
    
    // Verify ownership
    const existingWebhook = await webhookService.getWebhook(id, userId);
    if (!existingWebhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    await webhookService.deleteWebhook(id);

    return NextResponse.json({ message: "Webhook deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete webhook" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const PATCH = withApiAuth(handlePatch);
export const DELETE = withApiAuth(handleDelete);

