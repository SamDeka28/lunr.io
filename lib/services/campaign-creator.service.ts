import type { SupabaseClient } from "@supabase/supabase-js";
import { CampaignCreatorRepository } from "@/lib/db/repositories/campaign-creator.repository";
import { CampaignRepository } from "@/lib/db/repositories/campaign.repository";
import { LinkService } from "@/lib/services/link.service";
import { buildCreatorLinkUtm } from "@/lib/utils/utm";
import type {
  CampaignCreator,
  CreateCampaignCreatorInput,
  CreatorStatus,
} from "@/types/database.types";

export class CampaignCreatorService {
  private repo: CampaignCreatorRepository;
  private campaignRepo: CampaignRepository;
  private linkService: LinkService;
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.repo = new CampaignCreatorRepository(supabaseClient);
    this.campaignRepo = new CampaignRepository(supabaseClient);
    this.linkService = new LinkService(supabaseClient);
  }

  async list(campaignId: string, userId: string) {
    const campaign = await this.campaignRepo.getById(campaignId, userId);
    if (!campaign) throw new Error("Campaign not found");
    return this.repo.listByCampaign(campaignId, userId);
  }

  async create(input: CreateCampaignCreatorInput): Promise<CampaignCreator> {
    if (!input.display_name?.trim()) {
      throw new Error("Creator display name is required");
    }

    const campaign = await this.campaignRepo.getById(
      input.campaign_id,
      input.user_id
    );
    if (!campaign) throw new Error("Campaign not found");

    let linkId: string | null = null;

    if (input.generate_link !== false) {
      const destination =
        input.destination_url?.trim() ||
        campaign.default_destination_url?.trim() ||
        null;

      if (!destination) {
        throw new Error(
          "Add a Destination URL for this creator, or set a Default destination URL in campaign Settings first. That’s the landing page their short link will open."
        );
      }

      const utm = buildCreatorLinkUtm({
        campaignDefaults: campaign.utm_defaults as Record<string, string>,
        platform: input.platform || "other",
        handle: input.handle,
        utmSourceOverride: input.utm_source,
        utmContentOverride: input.utm_content,
      });

      const title = `${input.display_name.trim()}${
        input.handle ? ` (@${input.handle.replace(/^@/, "")})` : ""
      }`;

      const link = await this.linkService.createLink({
        original_url: destination,
        title,
        user_id: input.user_id,
        campaign_id: input.campaign_id,
        utm_parameters: utm,
      });
      linkId = link.id;
    }

    return this.repo.create({
      ...input,
      fee_currency: input.fee_currency || campaign.currency || "USD",
      link_id: linkId,
    });
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<CampaignCreator> & { create_spend_on_paid?: boolean }
  ): Promise<CampaignCreator> {
    const existing = await this.repo.getById(id, userId);
    if (!existing) throw new Error("Creator not found");

    const nextStatus = patch.status as CreatorStatus | undefined;
    if (nextStatus === "posted" && !patch.posted_at && !existing.posted_at) {
      patch.posted_at = new Date().toISOString();
    }

    const updated = await this.repo.update(id, userId, patch);

    if (
      patch.create_spend_on_paid &&
      nextStatus === "paid" &&
      existing.status !== "paid" &&
      updated.fee_amount &&
      Number(updated.fee_amount) > 0
    ) {
      await this.supabase.from("campaign_spend_entries").insert({
        campaign_id: updated.campaign_id,
        user_id: userId,
        campaign_creator_id: updated.id,
        amount: updated.fee_amount,
        currency: updated.fee_currency || "USD",
        spent_on: new Date().toISOString().slice(0, 10),
        note: `Creator fee: ${updated.display_name}`,
      });
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.repo.delete(id, userId);
  }

  async bulkCreate(
    campaignId: string,
    userId: string,
    rows: Array<{
      display_name: string;
      handle?: string;
      platform?: string;
      fee_amount?: number;
      destination_url?: string;
    }>
  ): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const row of rows) {
      try {
        await this.create({
          campaign_id: campaignId,
          user_id: userId,
          display_name: row.display_name,
          handle: row.handle || null,
          platform: (row.platform as any) || "other",
          fee_amount: row.fee_amount ?? null,
          destination_url: row.destination_url || null,
          generate_link: true,
        });
        created += 1;
      } catch (err: any) {
        errors.push(`${row.display_name || "row"}: ${err.message || "failed"}`);
      }
    }

    return { created, errors };
  }
}
