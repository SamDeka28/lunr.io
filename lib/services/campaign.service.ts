// Campaign Management Service
import { CampaignRepository } from "@/lib/db/repositories/campaign.repository";
import type { CreateCampaignInput, Campaign, CampaignWithStats } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCampaignUtmDefaults, computeCpc } from "@/lib/utils/utm";

export class CampaignService {
  private campaignRepo: CampaignRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.campaignRepo = new CampaignRepository(supabaseClient);
  }

  /**
   * Create a new campaign
   */
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
      input.utm_defaults
    );

    return await this.campaignRepo.create({
      ...input,
      name: input.name.trim(),
      utm_defaults,
    });
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string, userId: string): Promise<Campaign | null> {
    return await this.campaignRepo.getById(campaignId, userId);
  }

  /**
   * Get campaign with stats (includes CPC + target progress)
   */
  async getCampaignWithStats(campaignId: string, userId: string): Promise<CampaignWithStats | null> {
    const campaign = await this.campaignRepo.getByIdWithStats(campaignId, userId);
    if (!campaign) return null;

    const cpc = computeCpc(Number(campaign.budget) || 0, campaign.total_clicks);
    const targetProgress =
      campaign.target_clicks > 0
        ? Math.min((campaign.total_clicks / campaign.target_clicks) * 100, 100)
        : null;

    return {
      ...campaign,
      cpc,
      target_progress: targetProgress,
    };
  }

  /**
   * Get all campaigns for a user
   */
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    return await this.campaignRepo.getByUserId(userId);
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    userId: string,
    data: Partial<CreateCampaignInput>
  ): Promise<Campaign> {
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

    const updates: Partial<CreateCampaignInput> = { ...data };
    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }

    // Rebuild UTM defaults when name or utm_defaults provided
    if (data.utm_defaults !== undefined || data.name !== undefined) {
      const existing = await this.campaignRepo.getById(campaignId, userId);
      if (!existing) {
        throw new Error("Campaign not found");
      }
      const name = updates.name ?? existing.name;
      const utmInput =
        data.utm_defaults !== undefined
          ? data.utm_defaults
          : existing.utm_defaults;
      updates.utm_defaults = buildCampaignUtmDefaults(name, utmInput);
    }

    return await this.campaignRepo.update(campaignId, userId, updates);
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, userId: string): Promise<void> {
    return await this.campaignRepo.delete(campaignId, userId);
  }

  /**
   * Get links for a campaign
   */
  async getCampaignLinks(campaignId: string, userId: string) {
    return await this.campaignRepo.getCampaignLinks(campaignId, userId);
  }

  /**
   * Whether a campaign is currently within its active date window.
   * No dates = always in window (if is_active).
   */
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
}
