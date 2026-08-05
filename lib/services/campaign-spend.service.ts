import type { SupabaseClient } from "@supabase/supabase-js";
import type { CampaignSpendEntry } from "@/types/database.types";

export class CampaignSpendService {
  constructor(private supabase: SupabaseClient) {}

  async list(campaignId: string, userId: string): Promise<CampaignSpendEntry[]> {
    const { data, error } = await this.supabase
      .from("campaign_spend_entries")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .order("spent_on", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as CampaignSpendEntry[];
  }

  async totalSpend(campaignId: string, userId: string): Promise<number> {
    const entries = await this.list(campaignId, userId);
    return entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  async create(
    userId: string,
    input: {
      campaign_id: string;
      amount: number;
      currency?: string;
      spent_on?: string;
      note?: string;
      campaign_creator_id?: string | null;
    }
  ): Promise<CampaignSpendEntry> {
    if (!input.amount || input.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const { data: campaign } = await this.supabase
      .from("campaigns")
      .select("id, currency")
      .eq("id", input.campaign_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!campaign) throw new Error("Campaign not found");

    const { data, error } = await this.supabase
      .from("campaign_spend_entries")
      .insert({
        campaign_id: input.campaign_id,
        user_id: userId,
        amount: input.amount,
        currency: input.currency || campaign.currency || "USD",
        spent_on: input.spent_on || new Date().toISOString().slice(0, 10),
        note: input.note || null,
        campaign_creator_id: input.campaign_creator_id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as CampaignSpendEntry;
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("campaign_spend_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }
}
