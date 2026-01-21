// Link Management Service
import { LinkRepository } from "@/lib/db/repositories/link.repository";
import { validateURL } from "@/lib/utils/urlValidator";
import { generateShortCode, isValidShortCode } from "@/lib/utils/shortCodeGenerator";
import type { CreateLinkInput, Link } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class LinkService {
  private linkRepo: LinkRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.linkRepo = new LinkRepository(supabaseClient);
  }

  /**
   * Create a new short link
   */
  async createLink(input: CreateLinkInput): Promise<Link> {
    // Validate URL
    const validation = validateURL(input.original_url);
    if (!validation.isValid || !validation.normalizedUrl) {
      throw new Error(validation.error || "Invalid URL");
    }

    // Generate or validate short code
    let shortCode = input.short_code;
    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        throw new Error("Invalid short code format");
      }

      // Check if short code already exists
      const exists = await this.linkRepo.shortCodeExists(shortCode);
      if (exists) {
        throw new Error("Short code already exists");
      }
    } else {
      // Generate unique short code
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

    // Create link
    const link = await this.linkRepo.create({
      short_code: shortCode,
      original_url: validation.normalizedUrl,
      title: input.title || null,
      expires_at: input.expires_at || null,
      password: input.password || null,
      user_id: input.user_id || null,
      campaign_id: input.campaign_id || null,
      utm_parameters: (input as any).utm_parameters || null,
    });

    return link;
  }

  /**
   * Get link by short code
   */
  async getLinkByShortCode(shortCode: string): Promise<Link | null> {
    return await this.linkRepo.getByShortCode(shortCode);
  }

  /**
   * Get link by ID
   */
  async getLinkById(id: string): Promise<Link | null> {
    return await this.linkRepo.getById(id);
  }

  /**
   * Track click and get original URL
   */
  async trackClickAndGetUrl(shortCode: string): Promise<string | null> {
    const link = await this.getLinkByShortCode(shortCode);
    if (!link) {
      return null;
    }

    // Increment click count
    await this.linkRepo.incrementClickCount(link.id);

    return link.original_url;
  }

  /**
   * Delete link
   */
  async deleteLink(id: string): Promise<void> {
    await this.linkRepo.delete(id);
  }
}

