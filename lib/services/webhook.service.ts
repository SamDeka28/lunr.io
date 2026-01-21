// Webhook Service
import type { SupabaseClient } from "@supabase/supabase-js";
import { WebhookRepository, type CreateWebhookInput, type Webhook } from "@/lib/db/repositories/webhook.repository";
import { createHmac } from "crypto";

export class WebhookService {
  private webhookRepo: WebhookRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.webhookRepo = new WebhookRepository(supabaseClient);
  }

  /**
   * Create a new webhook
   */
  async createWebhook(input: CreateWebhookInput): Promise<Webhook> {
    // Validate URL
    try {
      new URL(input.url);
    } catch {
      throw new Error("Invalid webhook URL");
    }

    // Validate events
    const validEvents = [
      // Link events
      "link.created",
      "link.updated",
      "link.deleted",
      "link.clicked",
      // QR Code events
      "qr.created",
      "qr.updated",
      "qr.deleted",
      // Page events
      "page.created",
      "page.updated",
      "page.deleted",
      // Campaign events
      "campaign.created",
      "campaign.updated",
      "campaign.deleted",
    ];
    const invalidEvents = input.events.filter((e) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      throw new Error(`Invalid event types: ${invalidEvents.join(", ")}`);
    }

    return this.webhookRepo.create(input);
  }

  /**
   * Get all webhooks for a user
   */
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    return this.webhookRepo.getByUserId(userId);
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(webhookId: string, userId: string): Promise<Webhook | null> {
    return this.webhookRepo.getById(webhookId, userId);
  }

  /**
   * Update webhook
   */
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
      const validEvents = [
        // Link events
        "link.created",
        "link.updated",
        "link.deleted",
        "link.clicked",
        // QR Code events
        "qr.created",
        "qr.updated",
        "qr.deleted",
        // Page events
        "page.created",
        "page.updated",
        "page.deleted",
        // Campaign events
        "campaign.created",
        "campaign.updated",
        "campaign.deleted",
      ];
      const invalidEvents = updates.events.filter((e) => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        throw new Error(`Invalid event types: ${invalidEvents.join(", ")}`);
      }
    }

    return this.webhookRepo.update(webhookId, updates);
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    return this.webhookRepo.delete(webhookId);
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerWebhooks(
    userId: string,
    event: string,
    payload: any
  ): Promise<void> {
    try {
      const webhooks = await this.webhookRepo.getActiveByEvent(userId, event);

      // Trigger webhooks asynchronously
      for (const webhook of webhooks) {
        this.sendWebhook(webhook, event, payload).catch((error) => {
          console.error(`Failed to trigger webhook ${webhook.id}:`, error);
          this.webhookRepo.updateLastTriggered(webhook.id, false).catch(() => {
            // Ignore errors when updating last triggered
          });
        });
      }
    } catch (error: any) {
      // If webhooks table doesn't exist, log warning but don't fail
      if (error.message?.includes("Could not find the table") || error.message?.includes("webhooks")) {
        console.warn("Webhooks table not found. Webhook triggering skipped. Please apply the migration: supabase/migrations/add_webhooks_and_api_usage.sql");
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(webhook: Webhook, event: string, payload: any): Promise<void> {
    const signature = this.generateSignature(webhook.secret || "", JSON.stringify(payload));

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": event,
        "X-Webhook-Signature": signature,
        "X-Webhook-Id": webhook.id,
      },
      body: JSON.stringify(payload),
    });

    const success = response.ok;
    await this.webhookRepo.updateLastTriggered(webhook.id, success);

    if (!success) {
      throw new Error(`Webhook returned status ${response.status}`);
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(secret: string, payload: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Verify webhook signature (for incoming webhooks)
   */
  verifySignature(secret: string, payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return expectedSignature === signature;
  }
}

