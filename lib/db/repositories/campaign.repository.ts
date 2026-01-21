// Campaign Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Campaign, CreateCampaignInput, CampaignWithStats } from "@/types/database.types";

export class CampaignRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Create a new campaign
   */
  async create(data: CreateCampaignInput): Promise<Campaign> {
    const { data: campaign, error } = await this.supabase
      .from("campaigns")
      .insert({
        name: data.name,
        description: data.description || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        campaign_type: data.campaign_type || null,
        tags: data.tags || null,
        target_clicks: data.target_clicks || 0,
        budget: data.budget || 0,
        user_id: data.user_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    return campaign;
  }

  /**
   * Get campaign by ID
   */
  async getById(campaignId: string, userId: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all campaigns for a user
   */
  async getByUserId(userId: string): Promise<Campaign[]> {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get campaign with stats
   */
  async getByIdWithStats(campaignId: string, userId: string): Promise<CampaignWithStats | null> {
    const campaign = await this.getById(campaignId, userId);
    if (!campaign) return null;

    // Get links for this campaign
    const { data: links, error: linksError } = await this.supabase
      .from("links")
      .select("id, click_count")
      .eq("campaign_id", campaignId)
      .eq("is_active", true);

    if (linksError) {
      throw new Error(`Failed to get campaign links: ${linksError.message}`);
    }

    // Get analytics for all links in campaign
    const linkIds = links?.map((l) => l.id) || [];
    let totalClicks = 0;
    let uniqueClicks = 0;

    if (linkIds.length > 0) {
      // Sum click counts from links
      totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;

      // Get unique clicks from analytics
      const { data: analytics } = await this.supabase
        .from("analytics")
        .select("ip_address")
        .in("link_id", linkIds);

      const uniqueIps = new Set(
        analytics?.filter((a) => a.ip_address).map((a) => a.ip_address) || []
      );
      uniqueClicks = uniqueIps.size;
    }

    return {
      ...campaign,
      total_links: links?.length || 0,
      total_clicks: totalClicks,
      unique_clicks: uniqueClicks,
    };
  }

  /**
   * Update campaign
   */
  async update(
    campaignId: string,
    userId: string,
    data: Partial<CreateCampaignInput>
  ): Promise<Campaign> {
    const updateData: any = {
      name: data.name,
      description: data.description,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      updated_at: new Date().toISOString(),
    };

    // Only include these fields if they are explicitly provided
    if (data.campaign_type !== undefined) {
      updateData.campaign_type = data.campaign_type || null;
    }
    if (data.tags !== undefined) {
      updateData.tags = data.tags || null;
    }
    if (data.target_clicks !== undefined) {
      updateData.target_clicks = data.target_clicks || 0;
    }
    if (data.budget !== undefined) {
      updateData.budget = data.budget || 0;
    }

    const { data: campaign, error } = await this.supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", campaignId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    return campaign;
  }

  /**
   * Delete campaign (soft delete by setting is_active to false)
   */
  async delete(campaignId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("campaigns")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", campaignId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  /**
   * Get links for a campaign
   */
  async getCampaignLinks(campaignId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("links")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get campaign links: ${error.message}`);
    }

    return data || [];
  }
}

