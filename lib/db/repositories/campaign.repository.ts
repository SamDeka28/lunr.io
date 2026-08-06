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
        currency: data.currency || "USD",
        utm_defaults: data.utm_defaults || {},
        default_destination_url: data.default_destination_url || null,
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
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.start_date !== undefined) updateData.start_date = data.start_date || null;
    if (data.end_date !== undefined) updateData.end_date = data.end_date || null;

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
    if (data.currency !== undefined) {
      updateData.currency = data.currency || "USD";
    }
    if (data.utm_defaults !== undefined) {
      updateData.utm_defaults = data.utm_defaults || {};
    }
    if (data.default_destination_url !== undefined) {
      updateData.default_destination_url = data.default_destination_url || null;
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
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
   * Archive campaign (soft delete) and unassign all member links
   * so redirects are not blocked by an inactive campaign.
   */
  async delete(campaignId: string, userId: string): Promise<void> {
    const existing = await this.getById(campaignId, userId);
    if (!existing) {
      throw new Error("Campaign not found");
    }

    const { error: unassignError } = await this.supabase
      .from("links")
      .update({ campaign_id: null })
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    if (unassignError) {
      throw new Error(`Failed to unassign campaign links: ${unassignError.message}`);
    }

    const { error } = await this.supabase
      .from("campaigns")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", campaignId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to archive campaign: ${error.message}`);
    }
  }

  /**
   * Unassign all links from a campaign (without archiving).
   */
  async unassignAllLinks(campaignId: string, userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("links")
      .update({ campaign_id: null })
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .select("id");

    if (error) {
      throw new Error(`Failed to unassign links: ${error.message}`);
    }

    return data?.length || 0;
  }

  /**
   * Bulk assign / unassign links to a campaign.
   */
  async bulkSetLinkCampaign(
    campaignId: string | null,
    userId: string,
    linkIds: string[]
  ): Promise<string[]> {
    if (linkIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("links")
      .update({
        campaign_id: campaignId,
      })
      .in("id", linkIds)
      .eq("user_id", userId)
      .select("id");

    if (error) {
      throw new Error(`Failed to update link campaign assignment: ${error.message}`);
    }

    return (data || []).map((l) => l.id);
  }

  /**
   * Get all links for a campaign including inactive (for UTM propagation).
   */
  async getAllCampaignLinkIds(campaignId: string, userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("links")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get campaign link ids: ${error.message}`);
    }

    return (data || []).map((l) => l.id);
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

