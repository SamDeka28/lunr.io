// Campaign Management Service
import { CampaignRepository } from "@/lib/db/repositories/campaign.repository";
import type { CreateCampaignInput, Campaign, CampaignWithStats } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import {
  buildCampaignUtmDefaults,
  computeCpc,
  fillEmptyUtmFromDefaults,
} from "@/lib/utils/utm";

export class CampaignService {
  private campaignRepo: CampaignRepository;
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
    this.campaignRepo = new CampaignRepository(this.supabase);
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Campaign name is required");
    }

    if (input.name.length > 255) {
      throw new Error("Campaign name must be less than 255 characters");
    }

    if (input.start_date && input.end_date) {
      const start = new Date(input.start_date);
      const end = new Date(input.end_date);
      if (start > end) {
        throw new Error("Start date must be before end date");
      }
    }

    const utm_defaults = buildCampaignUtmDefaults(
      input.name.trim(),
      input.utm_defaults,
      input.campaign_type
    );

    return await this.campaignRepo.create({
      ...input,
      name: input.name.trim(),
      utm_defaults,
    });
  }

  async getCampaign(campaignId: string, userId: string): Promise<Campaign | null> {
    return await this.campaignRepo.getById(campaignId, userId);
  }

  async getCampaignWithStats(campaignId: string, userId: string): Promise<CampaignWithStats | null> {
    const campaign = await this.campaignRepo.getByIdWithStats(campaignId, userId);
    if (!campaign) return null;

    let totalCreators = 0;
    let totalSpend = 0;
    let totalConversions = 0;

    try {
      const [{ count: creatorCount }, spendRes, convRes] = await Promise.all([
        this.supabase
          .from("campaign_creators")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", campaignId)
          .eq("user_id", userId),
        this.supabase
          .from("campaign_spend_entries")
          .select("amount")
          .eq("campaign_id", campaignId)
          .eq("user_id", userId),
        this.supabase
          .from("conversion_events")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", campaignId)
          .eq("user_id", userId),
      ]);
      totalCreators = creatorCount || 0;
      totalSpend = (spendRes.data || []).reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      );
      totalConversions = convRes.count || 0;
    } catch {
      // tables may not exist during rollout
    }

    const spendForCpc = totalSpend > 0 ? totalSpend : Number(campaign.budget) || 0;
    const cpc = computeCpc(spendForCpc, campaign.total_clicks);
    const targetProgress =
      campaign.target_clicks > 0
        ? Math.min((campaign.total_clicks / campaign.target_clicks) * 100, 100)
        : null;

    return {
      ...campaign,
      cpc,
      target_progress: targetProgress,
      total_creators: totalCreators,
      total_spend: totalSpend,
      total_conversions: totalConversions,
    };
  }

  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    return await this.campaignRepo.getByUserId(userId);
  }

  /**
   * Update campaign. When UTM defaults (or name) change, fill empty UTM keys
   * on member links without overwriting explicit link values.
   */
  async updateCampaign(
    campaignId: string,
    userId: string,
    data: Partial<CreateCampaignInput>
  ): Promise<{ campaign: Campaign; utmLinksUpdated: number }> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error("Campaign name is required");
      }
      if (data.name.length > 255) {
        throw new Error("Campaign name must be less than 255 characters");
      }
    }

    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (start > end) {
        throw new Error("Start date must be before end date");
      }
    }

    const existing = await this.campaignRepo.getById(campaignId, userId);
    if (!existing) {
      throw new Error("Campaign not found");
    }

    const updates: Partial<CreateCampaignInput> = { ...data };
    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }

    const utmChanged =
      data.utm_defaults !== undefined ||
      data.name !== undefined ||
      data.campaign_type !== undefined;

    if (utmChanged) {
      const name = updates.name ?? existing.name;
      const campaignType =
        data.campaign_type !== undefined
          ? data.campaign_type
          : existing.campaign_type;
      const utmInput =
        data.utm_defaults !== undefined
          ? data.utm_defaults
          : existing.utm_defaults;
      updates.utm_defaults = buildCampaignUtmDefaults(name, utmInput, campaignType);
    }

    const campaign = await this.campaignRepo.update(campaignId, userId, updates);

    let utmLinksUpdated = 0;
    if (utmChanged && campaign.utm_defaults) {
      utmLinksUpdated = await this.propagateUtmDefaultsToMembers(
        campaignId,
        userId,
        campaign.utm_defaults as Record<string, string>
      );
    }

    return { campaign, utmLinksUpdated };
  }

  /**
   * Fill empty UTM keys on all member links from campaign defaults.
   */
  async propagateUtmDefaultsToMembers(
    campaignId: string,
    userId: string,
    defaults: Record<string, string>
  ): Promise<number> {
    const { data: links, error } = await this.supabase
      .from("links")
      .select("id, utm_parameters")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to load campaign links for UTM sync: ${error.message}`);
    }

    let updated = 0;
    for (const link of links || []) {
      const next = fillEmptyUtmFromDefaults(
        defaults,
        (link.utm_parameters as Record<string, string>) || null
      );
      const prev = JSON.stringify(link.utm_parameters || {});
      const nextStr = JSON.stringify(next || {});
      if (prev === nextStr) continue;

      const { error: updateError } = await this.supabase
        .from("links")
        .update({ utm_parameters: next })
        .eq("id", link.id)
        .eq("user_id", userId);

      if (!updateError) updated += 1;
    }

    return updated;
  }

  async deleteCampaign(campaignId: string, userId: string): Promise<void> {
    // Soft-archive creators if table exists (ignore if migration not applied yet)
    try {
      await this.supabase
        .from("campaign_creators")
        .update({ status: "dropped" })
        .eq("campaign_id", campaignId)
        .eq("user_id", userId);
    } catch {
      // table may not exist yet during rollout
    }

    return await this.campaignRepo.delete(campaignId, userId);
  }

  async getCampaignLinks(campaignId: string, userId: string) {
    return await this.campaignRepo.getCampaignLinks(campaignId, userId);
  }

  /**
   * Bulk assign or unassign links. On assign, merge campaign UTM into empty keys.
   */
  async bulkAssignLinks(
    campaignId: string,
    userId: string,
    linkIds: string[],
    action: "assign" | "unassign"
  ): Promise<{ updated: string[]; utmLinksUpdated: number }> {
    const campaign = await this.campaignRepo.getById(campaignId, userId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (action === "unassign") {
      const updated = await this.campaignRepo.bulkSetLinkCampaign(
        null,
        userId,
        linkIds
      );
      return { updated, utmLinksUpdated: 0 };
    }

    const updated = await this.campaignRepo.bulkSetLinkCampaign(
      campaignId,
      userId,
      linkIds
    );

    let utmLinksUpdated = 0;
    if (campaign.utm_defaults && updated.length > 0) {
      const { data: links } = await this.supabase
        .from("links")
        .select("id, utm_parameters")
        .in("id", updated);

      for (const link of links || []) {
        const next = fillEmptyUtmFromDefaults(
          campaign.utm_defaults as Record<string, string>,
          (link.utm_parameters as Record<string, string>) || null
        );
        const { error } = await this.supabase
          .from("links")
          .update({ utm_parameters: next })
          .eq("id", link.id);
        if (!error) utmLinksUpdated += 1;
      }
    }

    return { updated, utmLinksUpdated };
  }

  static isWithinDateWindow(campaign: {
    start_date?: string | null;
    end_date?: string | null;
    is_active?: boolean;
  }): { active: boolean; reason?: "inactive" | "not_started" | "ended" } {
    if (campaign.is_active === false) {
      return { active: false, reason: "inactive" };
    }
    const now = Date.now();
    if (campaign.start_date) {
      const start = new Date(campaign.start_date).getTime();
      if (!Number.isNaN(start) && now < start) {
        return { active: false, reason: "not_started" };
      }
    }
    if (campaign.end_date) {
      const end = new Date(campaign.end_date).getTime();
      if (!Number.isNaN(end) && now > end) {
        return { active: false, reason: "ended" };
      }
    }
    return { active: true };
  }

  static getStatusLabel(campaign: {
    start_date?: string | null;
    end_date?: string | null;
    is_active?: boolean;
  }): "active" | "scheduled" | "ended" | "archived" {
    if (campaign.is_active === false) return "archived";
    const window = CampaignService.isWithinDateWindow(campaign);
    if (window.reason === "not_started") return "scheduled";
    if (window.reason === "ended") return "ended";
    return "active";
  }
}
