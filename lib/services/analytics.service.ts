// Analytics Service
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AnalyticsRepository,
  type GetStatsOptions,
  type RecordClickInput,
} from "@/lib/db/repositories/analytics.repository";
import { parseUserAgent } from "@/lib/utils/ua";
import type { Analytics, LinkStats } from "@/types/database.types";

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.analyticsRepo = new AnalyticsRepository(supabaseClient);
  }

  /**
   * Track a click with detailed information.
   * Parses UA into device/browser/OS and sets is_bot.
   * Callers should skip incrementing link.click_count when the returned row
   * (or pre-check via parseUserAgent) indicates a bot.
   */
  async trackClick(
    data: Omit<
      RecordClickInput,
      "device_type" | "browser" | "os" | "is_bot"
    > & {
      device_type?: string | null;
      browser?: string | null;
      os?: string | null;
      is_bot?: boolean;
    }
  ): Promise<Analytics> {
    const parsed = parseUserAgent(data.user_agent);

    return await this.analyticsRepo.recordClick({
      ...data,
      device_type: data.device_type ?? parsed.deviceType,
      browser: data.browser ?? parsed.browser,
      os: data.os ?? parsed.os,
      is_bot: data.is_bot ?? parsed.isBot,
    });
  }

  /**
   * Get analytics for a link
   */
  async getAnalytics(
    linkId: string,
    options?: GetStatsOptions
  ): Promise<Analytics[]> {
    return await this.analyticsRepo.getByLinkId(linkId, options);
  }

  /**
   * Get statistics for a link (respects retention window via options.days).
   */
  async getStats(
    linkId: string,
    options?: GetStatsOptions
  ): Promise<LinkStats> {
    return await this.analyticsRepo.getStats(linkId, options);
  }
}
