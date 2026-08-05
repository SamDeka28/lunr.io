import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type {
  CampaignCreator,
  CreateCampaignCreatorInput,
  CreatorPlatform,
  CreatorStatus,
} from "@/types/database.types";

export class CampaignCreatorRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  async listByCampaign(
    campaignId: string,
    userId: string
  ): Promise<CampaignCreator[]> {
    const { data, error } = await this.supabase
      .from("campaign_creators")
      .select("*, link:links(*)")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list creators: ${error.message}`);
    }

    return (data || []) as CampaignCreator[];
  }

  async getById(id: string, userId: string): Promise<CampaignCreator | null> {
    const { data, error } = await this.supabase
      .from("campaign_creators")
      .select("*, link:links(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get creator: ${error.message}`);
    }

    return data as CampaignCreator | null;
  }

  async create(
    input: CreateCampaignCreatorInput & { link_id?: string | null }
  ): Promise<CampaignCreator> {
    const { data, error } = await this.supabase
      .from("campaign_creators")
      .insert({
        campaign_id: input.campaign_id,
        user_id: input.user_id,
        display_name: input.display_name.trim(),
        handle: input.handle?.trim().replace(/^@/, "") || null,
        platform: (input.platform || "other") as CreatorPlatform,
        profile_url: input.profile_url || null,
        status: (input.status || "invited") as CreatorStatus,
        fee_amount: input.fee_amount ?? null,
        fee_currency: input.fee_currency || "USD",
        deliverable_notes: input.deliverable_notes || null,
        due_at: input.due_at || null,
        link_id: input.link_id || null,
        utm_source: input.utm_source || null,
        utm_content: input.utm_content || null,
      })
      .select("*, link:links(*)")
      .single();

    if (error) {
      throw new Error(`Failed to create creator: ${error.message}`);
    }

    return data as CampaignCreator;
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<CampaignCreator>
  ): Promise<CampaignCreator> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const fields: (keyof CampaignCreator)[] = [
      "display_name",
      "handle",
      "platform",
      "profile_url",
      "status",
      "fee_amount",
      "fee_currency",
      "deliverable_notes",
      "due_at",
      "posted_at",
      "link_id",
      "utm_source",
      "utm_content",
    ];

    for (const key of fields) {
      if (patch[key] !== undefined) {
        updateData[key] = patch[key];
      }
    }

    const { data, error } = await this.supabase
      .from("campaign_creators")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*, link:links(*)")
      .single();

    if (error) {
      throw new Error(`Failed to update creator: ${error.message}`);
    }

    return data as CampaignCreator;
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("campaign_creators")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete creator: ${error.message}`);
    }
  }

  async findByLinkId(
    linkId: string,
    userId: string
  ): Promise<CampaignCreator | null> {
    const { data, error } = await this.supabase
      .from("campaign_creators")
      .select("*")
      .eq("link_id", linkId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find creator by link: ${error.message}`);
    }

    return data as CampaignCreator | null;
  }
}
