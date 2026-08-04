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
   * Track page view (counter + page_analytics event)
   */
  async trackView(
    id: string,
    meta?: { referrer?: string | null; userAgent?: string | null; country?: string | null }
  ): Promise<void> {
    await this.pageRepo.incrementViewCount(id);
    await this.pageRepo.insertAnalyticsEvent({
      pageId: id,
      eventType: "view",
      referrer: meta?.referrer,
      userAgent: meta?.userAgent,
      country: meta?.country,
    });
  }

  /**
   * Track page link click (counter + per-link analytics)
   */
  async trackClick(
    id: string,
    meta?: {
      linkId?: string | null;
      referrer?: string | null;
      userAgent?: string | null;
      country?: string | null;
    }
  ): Promise<void> {
    await this.pageRepo.incrementClickCount(id);
    await this.pageRepo.insertAnalyticsEvent({
      pageId: id,
      eventType: "click",
      linkId: meta?.linkId,
      referrer: meta?.referrer,
      userAgent: meta?.userAgent,
      country: meta?.country,
    });
  }

  /**
   * Aggregate analytics for dashboard
   */
  async getAnalyticsSummary(pageId: string, pageLinks: Array<{ id: string; title?: string }> = []) {
    const rows = await this.pageRepo.getAnalytics(pageId, 30);

    const eventsByDate: Record<string, { views: number; clicks: number }> = {};
    const referrers: Record<string, number> = {};
    const linkClicks: Record<string, number> = {};
    let views = 0;
    let clicks = 0;

    for (const row of rows) {
      const date = row.created_at.slice(0, 10);
      if (!eventsByDate[date]) eventsByDate[date] = { views: 0, clicks: 0 };

      if (row.event_type === "view") {
        views += 1;
        eventsByDate[date].views += 1;
      } else if (row.event_type === "click") {
        clicks += 1;
        eventsByDate[date].clicks += 1;
        if (row.link_id) {
          linkClicks[row.link_id] = (linkClicks[row.link_id] || 0) + 1;
        }
      }

      if (row.event_type === "view" || row.event_type === "click") {
        let ref = "Direct";
        if (row.referrer) {
          try {
            ref = new URL(row.referrer).hostname.replace(/^www\./, "") || "Direct";
          } catch {
            ref = row.referrer.slice(0, 40);
          }
        }
        referrers[ref] = (referrers[ref] || 0) + 1;
      }
    }

    const timeSeries = Object.entries(eventsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    const topReferrers = Object.entries(referrers)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const perLinkCtr = pageLinks.map((link) => {
      const linkClickCount = linkClicks[link.id] || 0;
      return {
        linkId: link.id,
        title: link.title || link.id,
        clicks: linkClickCount,
        ctr: views > 0 ? Number(((linkClickCount / views) * 100).toFixed(1)) : 0,
      };
    });

    return {
      views,
      clicks,
      timeSeries,
      topReferrers,
      perLinkCtr,
      overallCtr: views > 0 ? Number(((clicks / views) * 100).toFixed(1)) : 0,
    };
  }
}

