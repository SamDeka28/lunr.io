// Link Management Service
import { LinkRepository } from "@/lib/db/repositories/link.repository";
import { validateURL } from "@/lib/utils/urlValidator";
import {
  generateShortCode,
  getShortCodeContentError,
  isValidShortCode,
  normalizeShortCode,
} from "@/lib/utils/shortCodeGenerator";
import { mergeCampaignUtmDefaults } from "@/lib/utils/utm";
import type { CreateLinkInput, Link } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";

export class LinkService {
  private linkRepo: LinkRepository;
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.linkRepo = new LinkRepository(supabaseClient);
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Create a new short link.
   * When campaign_id is set, campaign UTM defaults are merged (link values win).
   */
  async createLink(input: CreateLinkInput): Promise<Link> {
    const validation = validateURL(input.original_url);
    if (!validation.isValid || !validation.normalizedUrl) {
      throw new Error(validation.error || "Invalid URL");
    }

    const { checkUrlSafety } = await import("@/lib/utils/urlValidator");
    const safety = await checkUrlSafety(validation.normalizedUrl);
    if (!safety.safe) {
      throw new Error(safety.error || "URL failed safety check");
    }

    let shortCode = input.short_code ? normalizeShortCode(input.short_code) : undefined;
    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        throw new Error("Invalid short code format");
      }
      const contentError = getShortCodeContentError(shortCode);
      if (contentError) {
        throw new Error(contentError);
      }

      const exists = await this.linkRepo.shortCodeExists(shortCode);
      if (exists) {
        throw new Error("Short code already exists");
      }
    } else {
      let attempts = 0;
      const maxAttempts = 10;

      do {
        shortCode = generateShortCode();
        const exists = await this.linkRepo.shortCodeExists(shortCode);
        if (!exists) {
          break;
        }
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique short code");
      }
    }

    let utmParameters = input.utm_parameters || null;

    if (input.campaign_id) {
      const { data: campaign } = await this.supabase
        .from("campaigns")
        .select("utm_defaults")
        .eq("id", input.campaign_id)
        .maybeSingle();

      if (campaign?.utm_defaults) {
        utmParameters = mergeCampaignUtmDefaults(
          campaign.utm_defaults as Record<string, string>,
          utmParameters
        );
      }
    }

    const link = await this.linkRepo.create({
      short_code: shortCode!,
      original_url: validation.normalizedUrl,
      title: input.title || null,
      expires_at: input.expires_at || null,
      password: input.password || null,
      user_id: input.user_id || null,
      campaign_id: input.campaign_id || null,
      utm_parameters: utmParameters,
      tags: input.tags || null,
      folder: input.folder || null,
      max_clicks: input.max_clicks ?? null,
      targeting: input.targeting || null,
    });

    return link;
  }

  /**
   * Merge campaign UTM defaults into a link when assigning / updating campaign.
   * Link-specific UTM values win. Returns the merged utm_parameters to persist.
   */
  async mergeUtmForCampaignAssignment(
    campaignId: string | null,
    existingUtm: Record<string, string> | null | undefined,
    incomingUtm?: Record<string, string> | null
  ): Promise<Record<string, string> | null> {
    const linkUtm =
      incomingUtm !== undefined ? incomingUtm : existingUtm || null;

    if (!campaignId) {
      return linkUtm;
    }

    const { data: campaign } = await this.supabase
      .from("campaigns")
      .select("utm_defaults")
      .eq("id", campaignId)
      .maybeSingle();

    if (!campaign?.utm_defaults) {
      return linkUtm;
    }

    return mergeCampaignUtmDefaults(
      campaign.utm_defaults as Record<string, string>,
      linkUtm
    );
  }

  async getLinkByShortCode(shortCode: string): Promise<Link | null> {
    return await this.linkRepo.getByShortCode(shortCode);
  }

  async getLinkById(id: string): Promise<Link | null> {
    return await this.linkRepo.getById(id);
  }

  async trackClickAndGetUrl(shortCode: string): Promise<string | null> {
    const link = await this.getLinkByShortCode(shortCode);
    if (!link) {
      return null;
    }

    await this.linkRepo.incrementClickCount(link.id);

    return link.original_url;
  }

  async deleteLink(id: string): Promise<void> {
    await this.linkRepo.delete(id);
  }
}
