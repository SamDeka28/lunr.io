// Analytics Service
import type { SupabaseClient } from "@supabase/supabase-js";
import { AnalyticsRepository } from "@/lib/db/repositories/analytics.repository";
import type { Analytics, LinkStats } from "@/types/database.types";

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.analyticsRepo = new AnalyticsRepository(supabaseClient);
  }

  /**
   * Track a click with detailed information
   */
  async trackClick(data: {
    link_id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    referrer?: string | null;
    country?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
  }): Promise<Analytics> {
    return await this.analyticsRepo.recordClick(data);
  }

  /**
   * Get analytics for a link
   */
  async getAnalytics(linkId: string): Promise<Analytics[]> {
    return await this.analyticsRepo.getByLinkId(linkId);
  }

  /**
   * Get statistics for a link
   */
  async getStats(linkId: string): Promise<LinkStats> {
    return await this.analyticsRepo.getStats(linkId);
  }
}

