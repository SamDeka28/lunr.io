// Page Service - Business Logic Module
import { PageRepository } from "@/lib/db/repositories/page.repository";
import type { Page, CreatePageInput } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class PageService {
  private pageRepo: PageRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.pageRepo = new PageRepository(supabaseClient);
  }

  /**
   * Create a new page
   */
  async createPage(userId: string, data: CreatePageInput): Promise<Page> {
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(data.slug.toLowerCase())) {
      throw new Error("Slug can only contain lowercase letters, numbers, and hyphens");
    }

    if (data.slug.length < 2 || data.slug.length > 100) {
      throw new Error("Slug must be between 2 and 100 characters");
    }

    return await this.pageRepo.create(userId, data);
  }

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<Page | null> {
    return await this.pageRepo.getById(id);
  }

  /**
   * Get page by slug (public)
   */
  async getPageBySlug(slug: string): Promise<Page | null> {
    return await this.pageRepo.getBySlug(slug);
  }

  /**
   * Get all pages for a user
   */
  async getUserPages(userId: string): Promise<Page[]> {
    return await this.pageRepo.getByUserId(userId);
  }

  /**
   * Update page
   */
  async updatePage(id: string, updates: Partial<CreatePageInput>): Promise<Page> {
    if (updates.slug) {
      if (!/^[a-z0-9-]+$/.test(updates.slug.toLowerCase())) {
        throw new Error("Slug can only contain lowercase letters, numbers, and hyphens");
      }

      if (updates.slug.length < 2 || updates.slug.length > 100) {
        throw new Error("Slug must be between 2 and 100 characters");
      }
    }

    return await this.pageRepo.update(id, updates);
  }

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<void> {
    return await this.pageRepo.delete(id);
  }

  /**
   * Track page view
   */
  async trackView(id: string): Promise<void> {
    return await this.pageRepo.incrementViewCount(id);
  }

  /**
   * Track page click
   */
  async trackClick(id: string): Promise<void> {
    return await this.pageRepo.incrementClickCount(id);
  }
}

