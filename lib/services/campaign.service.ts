// Campaign Management Service
import { CampaignRepository } from "@/lib/db/repositories/campaign.repository";
import type { CreateCampaignInput, Campaign, CampaignWithStats } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class CampaignService {
  private campaignRepo: CampaignRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.campaignRepo = new CampaignRepository(supabaseClient);
  }

  /**
   * Create a new campaign
   */
  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Campaign name is required");
    }

    if (input.name.length > 255) {
      throw new Error("Campaign name must be less than 255 characters");
    }

    // Validate dates if provided
    if (input.start_date && input.end_date) {
      const start = new Date(input.start_date);
      const end = new Date(input.end_date);
      if (start > end) {
        throw new Error("Start date must be before end date");
      }
    }

    return await this.campaignRepo.create(input);
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string, userId: string): Promise<Campaign | null> {
    return await this.campaignRepo.getById(campaignId, userId);
  }

  /**
   * Get campaign with stats
   */
  async getCampaignWithStats(campaignId: string, userId: string): Promise<CampaignWithStats | null> {
    return await this.campaignRepo.getByIdWithStats(campaignId, userId);
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
    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error("Campaign name is required");
      }
      if (data.name.length > 255) {
        throw new Error("Campaign name must be less than 255 characters");
      }
    }

    // Validate dates if provided
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (start > end) {
        throw new Error("Start date must be before end date");
      }
    }

    return await this.campaignRepo.update(campaignId, userId, data);
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
}

