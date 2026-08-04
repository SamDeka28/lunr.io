// Webhook Service — with retries, timeouts, and delivery logs
import type { SupabaseClient } from "@supabase/supabase-js";
import { WebhookRepository, type CreateWebhookInput, type Webhook } from "@/lib/db/repositories/webhook.repository";
import { createHmac } from "crypto";

const VALID_EVENTS = [
  "link.created",
  "link.updated",
  "link.deleted",
  "link.clicked",
  "qr.created",
  "qr.updated",
  "qr.deleted",
  "page.created",
  "page.updated",
  "page.deleted",
  "campaign.created",
  "campaign.updated",
  "campaign.deleted",
];

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10_000;
const BACKOFF_MS = [0, 1000, 3000];

export class WebhookService {
  private webhookRepo: WebhookRepository;
  private supabase: SupabaseClient | null;

  constructor(supabaseClient?: SupabaseClient) {
    this.webhookRepo = new WebhookRepository(supabaseClient);
    this.supabase = supabaseClient || null;
  }

  async createWebhook(input: CreateWebhookInput): Promise<Webhook> {
    try {
      new URL(input.url);
    } catch {
      throw new Error("Invalid webhook URL");
    }

    const invalidEvents = input.events.filter((e) => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      throw new Error(`Invalid event types: ${invalidEvents.join(", ")}`);
    }

    return this.webhookRepo.create(input);
  }

  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    return this.webhookRepo.getByUserId(userId);
  }

  async getWebhook(webhookId: string, userId: string): Promise<Webhook | null> {
    return this.webhookRepo.getById(webhookId, userId);
  }

  async updateWebhook(
    webhookId: string,
    updates: {
      name?: string;
      url?: string;
      events?: string[];
      is_active?: boolean;
    }
  ): Promise<Webhook> {
    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        throw new Error("Invalid webhook URL");
      }
    }

    if (updates.events) {
      const invalidEvents = updates.events.filter((e) => !VALID_EVENTS.includes(e));
      if (invalidEvents.length > 0) {
        throw new Error(`Invalid event types: ${invalidEvents.join(", ")}`);
      }
    }

    return this.webhookRepo.update(webhookId, updates);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    return this.webhookRepo.delete(webhookId);
  }

  /**
   * Trigger webhooks for an event (fire-and-forget with retries)
   */
  async triggerWebhooks(
    userId: string,
    event: string,
    payload: any
  ): Promise<void> {
    try {
      const webhooks = await this.webhookRepo.getActiveByEvent(userId, event);

      for (const webhook of webhooks) {
        this.deliverWithRetries(webhook, event, payload).catch((error) => {
          console.error(`Failed to trigger webhook ${webhook.id}:`, error);
        });
      }
    } catch (error: any) {
      if (error.message?.includes("Could not find the table") || error.message?.includes("webhooks")) {
        console.warn("Webhooks table not found. Webhook triggering skipped.");
        return;
      }
      throw error;
    }
  }

  private async deliverWithRetries(
    webhook: Webhook,
    event: string,
    payload: any
  ): Promise<void> {
    let lastError: string | null = null;
    let lastStatus: number | null = null;
    let success = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (BACKOFF_MS[attempt - 1]) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt - 1]));
      }

      try {
        const result = await this.sendWebhookOnce(webhook, event, payload);
        lastStatus = result.status;
        success = result.ok;
        await this.logDelivery(webhook.id, event, payload, result.status, result.ok, attempt, null);
        if (result.ok) break;
        lastError = `HTTP ${result.status}`;
      } catch (error: any) {
        lastError = error.message || "Delivery failed";
        await this.logDelivery(webhook.id, event, payload, null, false, attempt, lastError);
      }
    }

    await this.webhookRepo.updateLastTriggered(webhook.id, success);
    if (!success) {
      throw new Error(lastError || `Webhook failed after ${MAX_ATTEMPTS} attempts (last status: ${lastStatus})`);
    }
  }

  private async sendWebhookOnce(
    webhook: Webhook,
    event: string,
    payload: any
  ): Promise<{ ok: boolean; status: number }> {
    const body = JSON.stringify({
      event,
      data: payload,
      delivered_at: new Date().toISOString(),
    });
    const signature = this.generateSignature(webhook.secret || "", body);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": event,
          "X-Webhook-Signature": signature,
          "X-Webhook-Id": webhook.id,
        },
        body,
        signal: controller.signal,
      });
      return { ok: response.ok, status: response.status };
    } finally {
      clearTimeout(timer);
    }
  }

  private async logDelivery(
    webhookId: string,
    event: string,
    payload: any,
    statusCode: number | null,
    success: boolean,
    attempt: number,
    error: string | null
  ): Promise<void> {
    if (!this.supabase) return;
    try {
      await this.supabase.from("webhook_deliveries").insert({
        webhook_id: webhookId,
        event,
        payload,
        status_code: statusCode,
        success,
        attempt,
        error,
      });
    } catch (err) {
      console.error("Failed to log webhook delivery:", err);
    }
  }

  private generateSignature(secret: string, payload: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  verifySignature(secret: string, payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return expectedSignature === signature;
  }
}
