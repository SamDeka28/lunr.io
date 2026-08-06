import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversionEvent } from "@/types/database.types";

export class ConversionService {
  constructor(private supabase: SupabaseClient) {}

  async record(input: {
    user_id: string;
    event_name?: string;
    value?: number | null;
    currency?: string | null;
    campaign_id?: string | null;
    link_id?: string | null;
    short_code?: string | null;
    metadata?: Record<string, unknown> | null;
    occurred_at?: string | null;
    idempotency_key?: string | null;
  }): Promise<ConversionEvent> {
    let linkId = input.link_id || null;
    let campaignId = input.campaign_id || null;
    let shortCode = input.short_code || null;
    let creatorId: string | null = null;

    if (shortCode && !linkId) {
      const { data: link } = await this.supabase
        .from("links")
        .select("id, campaign_id, user_id")
        .eq("short_code", shortCode)
        .maybeSingle();

      if (link) {
        if (link.user_id && link.user_id !== input.user_id) {
          throw new Error("Short code does not belong to this account");
        }
        linkId = link.id;
        if (!campaignId) campaignId = link.campaign_id;
      }
    }

    if (linkId && !campaignId) {
      const { data: link } = await this.supabase
        .from("links")
        .select("campaign_id, user_id")
        .eq("id", linkId)
        .maybeSingle();
      if (link) {
        if (link.user_id && link.user_id !== input.user_id) {
          throw new Error("Link does not belong to this account");
        }
        campaignId = link.campaign_id;
      }
    }

    if (campaignId) {
      const { data: campaign } = await this.supabase
        .from("campaigns")
        .select("id, user_id")
        .eq("id", campaignId)
        .maybeSingle();
      if (!campaign) {
        throw new Error("Campaign not found");
      }
      if (campaign.user_id !== input.user_id) {
        throw new Error("Campaign does not belong to this account");
      }
    }

    if (linkId) {
      const { data: creator } = await this.supabase
        .from("campaign_creators")
        .select("id")
        .eq("link_id", linkId)
        .eq("user_id", input.user_id)
        .maybeSingle();
      creatorId = creator?.id || null;
    }

    if (input.idempotency_key) {
      const { data: existing } = await this.supabase
        .from("conversion_events")
        .select("*")
        .eq("user_id", input.user_id)
        .eq("idempotency_key", input.idempotency_key)
        .maybeSingle();
      if (existing) return existing as ConversionEvent;
    }

    const { data, error } = await this.supabase
      .from("conversion_events")
      .insert({
        user_id: input.user_id,
        campaign_id: campaignId,
        link_id: linkId,
        campaign_creator_id: creatorId,
        short_code: shortCode,
        event_name: input.event_name || "conversion",
        value: input.value ?? null,
        currency: input.currency || null,
        metadata: input.metadata || {},
        occurred_at: input.occurred_at || new Date().toISOString(),
        idempotency_key: input.idempotency_key || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Fire webhook (best effort)
    try {
      const { WebhookService } = await import("@/lib/services/webhook.service");
      const webhookService = new WebhookService(this.supabase);
      await webhookService.triggerWebhooks(
        input.user_id,
        "conversion.recorded" as any,
        data
      );
    } catch (err) {
      console.error("Failed to trigger conversion webhook:", err);
    }

    return data as ConversionEvent;
  }

  async listForCampaign(
    campaignId: string,
    userId: string,
    fromIso?: string,
    toIso?: string
  ): Promise<ConversionEvent[]> {
    let query = this.supabase
      .from("conversion_events")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false });

    if (fromIso) query = query.gte("occurred_at", fromIso);
    if (toIso) query = query.lte("occurred_at", toIso);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as ConversionEvent[];
  }
}
