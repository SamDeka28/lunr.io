// Analytics Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Analytics, LinkStats } from "@/types/database.types";

export type RecordClickInput = {
  link_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  country?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  is_bot?: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
};

export type GetStatsOptions = {
  /**
   * Retention window in days. -1 / null = unlimited.
   * Defaults to 30 when omitted.
   */
  days?: number | null;
};

/**
 * Unique click definition (documented for callers):
 * A unique click is a distinct IP address within a 24-hour UTC calendar-day
 * window per link. Same IP twice on 2026-08-04 = 1 unique; again on 2026-08-05 = 2.
 */
function countUniqueClicks(
  rows: Array<{ ip_address: string | null; clicked_at: string }>
): number {
  const keys = new Set<string>();
  for (const row of rows) {
    if (!row.ip_address) continue;
    const day = new Date(row.clicked_at).toISOString().slice(0, 10);
    keys.add(`${row.ip_address}|${day}`);
  }
  return keys.size;
}

function sinceIso(days: number | null | undefined): string | null {
  if (days == null || days < 0) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export class AnalyticsRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Record a click event (including bots; callers decide whether to bump click_count).
   */
  async recordClick(data: RecordClickInput): Promise<Analytics> {
    const { data: analytics, error } = await this.supabase
      .from("analytics")
      .insert({
        link_id: data.link_id,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
        referrer: data.referrer || null,
        country: data.country || null,
        device_type: data.device_type || null,
        browser: data.browser || null,
        os: data.os || null,
        is_bot: data.is_bot ?? false,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_term: data.utm_term || null,
        utm_content: data.utm_content || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record click: ${error.message}`);
    }

    return analytics;
  }

  /**
   * Get analytics for a specific link
   */
  async getByLinkId(
    linkId: string,
    options?: GetStatsOptions
  ): Promise<Analytics[]> {
    let query = this.supabase
      .from("analytics")
      .select("*")
      .eq("link_id", linkId)
      .order("clicked_at", { ascending: false });

    const since = sinceIso(options?.days);
    if (since) {
      query = query.gte("clicked_at", since);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get statistics for a link. Prefers Postgres RPC; falls back to JS aggregation.
   */
  async getStats(
    linkId: string,
    options?: GetStatsOptions
  ): Promise<LinkStats> {
    const days =
      options?.days === undefined || options?.days === null
        ? 30
        : options.days;

    const retentionTruncated = await this.isRetentionTruncated(linkId, days);

    // Prefer SQL aggregation RPC
    try {
      const { data, error } = await this.supabase.rpc(
        "get_link_analytics_stats",
        {
          p_link_id: linkId,
          p_days: days,
        }
      );

      if (!error && data) {
        const rpc = typeof data === "string" ? JSON.parse(data) : data;
        const utm = await this.getUtmStats(linkId, days);
        return {
          total_clicks: rpc.total_clicks ?? 0,
          unique_clicks: rpc.unique_clicks ?? 0,
          clicks_by_date: rpc.clicks_by_day ?? [],
          top_referrers: (rpc.clicks_by_referrer ?? []).slice(0, 10),
          clicks_by_country: (rpc.clicks_by_country ?? []).slice(0, 10),
          clicks_by_device: rpc.clicks_by_device ?? [],
          clicks_by_browser: rpc.clicks_by_browser ?? [],
          clicks_by_os: rpc.clicks_by_os ?? [],
          ...utm,
          retention_days: days,
          retention_truncated: retentionTruncated,
        };
      }
    } catch {
      // RPC missing or unavailable — fall through to JS aggregation
    }

    return {
      ...(await this.getStatsJsFallback(linkId, days)),
      retention_days: days,
      retention_truncated: retentionTruncated,
    };
  }

  private async isRetentionTruncated(
    linkId: string,
    days: number
  ): Promise<boolean> {
    if (days < 0) return false;
    const since = sinceIso(days);
    if (!since) return false;

    const { count, error } = await this.supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("link_id", linkId)
      .eq("is_bot", false)
      .lt("clicked_at", since);

    if (error) return false;
    return (count || 0) > 0;
  }

  private async getUtmStats(
    linkId: string,
    days: number
  ): Promise<
    Pick<LinkStats, "utm_sources" | "utm_mediums" | "utm_campaigns">
  > {
    let query = this.supabase
      .from("analytics")
      .select("utm_source, utm_medium, utm_campaign")
      .eq("link_id", linkId)
      .eq("is_bot", false);

    const since = sinceIso(days);
    if (since) {
      query = query.gte("clicked_at", since);
    }

    const { data: utmData } = await query;

    const utmSourceCounts: Record<string, number> = {};
    const utmMediumCounts: Record<string, number> = {};
    const utmCampaignCounts: Record<string, number> = {};

    utmData?.forEach((item) => {
      if (item.utm_source) {
        utmSourceCounts[item.utm_source] =
          (utmSourceCounts[item.utm_source] || 0) + 1;
      }
      if (item.utm_medium) {
        utmMediumCounts[item.utm_medium] =
          (utmMediumCounts[item.utm_medium] || 0) + 1;
      }
      if (item.utm_campaign) {
        utmCampaignCounts[item.utm_campaign] =
          (utmCampaignCounts[item.utm_campaign] || 0) + 1;
      }
    });

    const toSorted = (obj: Record<string, number>, key: string) =>
      Object.entries(obj)
        .map(([k, count]) => ({ [key]: k, count }) as any)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
      utm_sources: toSorted(utmSourceCounts, "source"),
      utm_mediums: toSorted(utmMediumCounts, "medium"),
      utm_campaigns: toSorted(utmCampaignCounts, "campaign"),
    };
  }

  /**
   * JS fallback when get_link_analytics_stats RPC is not available.
   */
  private async getStatsJsFallback(
    linkId: string,
    days: number
  ): Promise<Omit<LinkStats, "retention_days" | "retention_truncated">> {
    let query = this.supabase
      .from("analytics")
      .select(
        "clicked_at, ip_address, referrer, country, device_type, browser, os, utm_source, utm_medium, utm_campaign"
      )
      .eq("link_id", linkId)
      .eq("is_bot", false);

    const since = sinceIso(days);
    if (since) {
      query = query.gte("clicked_at", since);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to get analytics stats: ${error.message}`);
    }

    const rows = data || [];
    const totalClicks = rows.length;
    const uniqueClicks = countUniqueClicks(rows);

    const clicksByDate: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const utmSourceCounts: Record<string, number> = {};
    const utmMediumCounts: Record<string, number> = {};
    const utmCampaignCounts: Record<string, number> = {};

    for (const item of rows) {
      const date = new Date(item.clicked_at).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      const referrer = item.referrer || "Direct";
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

      if (item.country) {
        countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
      }

      const device = item.device_type || "unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      const browser = item.browser || "unknown";
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;

      const os = item.os || "unknown";
      osCounts[os] = (osCounts[os] || 0) + 1;

      if (item.utm_source) {
        utmSourceCounts[item.utm_source] =
          (utmSourceCounts[item.utm_source] || 0) + 1;
      }
      if (item.utm_medium) {
        utmMediumCounts[item.utm_medium] =
          (utmMediumCounts[item.utm_medium] || 0) + 1;
      }
      if (item.utm_campaign) {
        utmCampaignCounts[item.utm_campaign] =
          (utmCampaignCounts[item.utm_campaign] || 0) + 1;
      }
    }

    const sortEntries = <T extends string>(
      obj: Record<string, number>,
      key: T
    ) =>
      Object.entries(obj)
        .map(([k, count]) => ({ [key]: k, count }) as Record<T, string> & {
          count: number;
        })
        .sort((a, b) => b.count - a.count);

    return {
      total_clicks: totalClicks,
      unique_clicks: uniqueClicks,
      clicks_by_date: Object.entries(clicksByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      top_referrers: sortEntries(referrerCounts, "referrer")
        .map((r) => ({ referrer: r.referrer, count: r.count }))
        .slice(0, 10),
      clicks_by_country: sortEntries(countryCounts, "country")
        .map((r) => ({ country: r.country, count: r.count }))
        .slice(0, 10),
      clicks_by_device: sortEntries(deviceCounts, "device").map((r) => ({
        device: r.device,
        count: r.count,
      })),
      clicks_by_browser: sortEntries(browserCounts, "browser").map((r) => ({
        browser: r.browser,
        count: r.count,
      })),
      clicks_by_os: sortEntries(osCounts, "os").map((r) => ({
        os: r.os,
        count: r.count,
      })),
      utm_sources: sortEntries(utmSourceCounts, "source")
        .map((r) => ({ source: r.source, count: r.count }))
        .slice(0, 10),
      utm_mediums: sortEntries(utmMediumCounts, "medium")
        .map((r) => ({ medium: r.medium, count: r.count }))
        .slice(0, 10),
      utm_campaigns: sortEntries(utmCampaignCounts, "campaign")
        .map((r) => ({ campaign: r.campaign, count: r.count }))
        .slice(0, 10),
    };
  }
}
