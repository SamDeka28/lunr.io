// Analytics Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Analytics, LinkStats } from "@/types/database.types";

export class AnalyticsRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Record a click event
   */
  async recordClick(data: {
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
    const { data: analytics, error } = await this.supabase
      .from("analytics")
      .insert({
        link_id: data.link_id,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
        referrer: data.referrer || null,
        country: data.country || null,
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
  async getByLinkId(linkId: string): Promise<Analytics[]> {
    const { data, error } = await this.supabase
      .from("analytics")
      .select("*")
      .eq("link_id", linkId)
      .order("clicked_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get statistics for a link
   */
  async getStats(linkId: string): Promise<LinkStats> {
    // Get total clicks
    const { count: totalClicks, error: countError } = await this.supabase
      .from("analytics")
      .select("*", { count: "exact", head: true })
      .eq("link_id", linkId);

    if (countError) {
      throw new Error(`Failed to get click count: ${countError.message}`);
    }

    // Get unique clicks (by IP address)
    const { data: uniqueData, error: uniqueError } = await this.supabase
      .from("analytics")
      .select("ip_address")
      .eq("link_id", linkId);

    if (uniqueError) {
      throw new Error(`Failed to get unique clicks: ${uniqueError.message}`);
    }

    const uniqueIps = new Set(
      uniqueData?.filter((a) => a.ip_address).map((a) => a.ip_address) || []
    );
    const uniqueClicks = uniqueIps.size;

    // Get clicks by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dateData, error: dateError } = await this.supabase
      .from("analytics")
      .select("clicked_at")
      .eq("link_id", linkId)
      .gte("clicked_at", thirtyDaysAgo.toISOString());

    if (dateError) {
      throw new Error(`Failed to get date data: ${dateError.message}`);
    }

    // Group by date
    const clicksByDate: { [key: string]: number } = {};
    dateData?.forEach((item) => {
      const date = new Date(item.clicked_at).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    const clicksByDateArray = Object.entries(clicksByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top referrers
    const { data: referrerData, error: referrerError } = await this.supabase
      .from("analytics")
      .select("referrer")
      .eq("link_id", linkId)
      .not("referrer", "is", null);

    if (referrerError) {
      throw new Error(`Failed to get referrer data: ${referrerError.message}`);
    }

    const referrerCounts: { [key: string]: number } = {};
    referrerData?.forEach((item) => {
      const referrer = item.referrer || "Direct";
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get clicks by country
    const { data: countryData, error: countryError } = await this.supabase
      .from("analytics")
      .select("country")
      .eq("link_id", linkId)
      .not("country", "is", null);

    if (countryError) {
      throw new Error(`Failed to get country data: ${countryError.message}`);
    }

    const countryCounts: { [key: string]: number } = {};
    countryData?.forEach((item) => {
      const country = item.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const clicksByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get UTM analytics
    const { data: utmData, error: utmError } = await this.supabase
      .from("analytics")
      .select("utm_source, utm_medium, utm_campaign, utm_term, utm_content")
      .eq("link_id", linkId);

    if (utmError) {
      console.error("Failed to get UTM data:", utmError);
    }

    // Aggregate UTM data
    const utmSourceCounts: { [key: string]: number } = {};
    const utmMediumCounts: { [key: string]: number } = {};
    const utmCampaignCounts: { [key: string]: number } = {};
    const utmTermCounts: { [key: string]: number } = {};
    const utmContentCounts: { [key: string]: number } = {};

    utmData?.forEach((item) => {
      if (item.utm_source) {
        utmSourceCounts[item.utm_source] = (utmSourceCounts[item.utm_source] || 0) + 1;
      }
      if (item.utm_medium) {
        utmMediumCounts[item.utm_medium] = (utmMediumCounts[item.utm_medium] || 0) + 1;
      }
      if (item.utm_campaign) {
        utmCampaignCounts[item.utm_campaign] = (utmCampaignCounts[item.utm_campaign] || 0) + 1;
      }
      if (item.utm_term) {
        utmTermCounts[item.utm_term] = (utmTermCounts[item.utm_term] || 0) + 1;
      }
      if (item.utm_content) {
        utmContentCounts[item.utm_content] = (utmContentCounts[item.utm_content] || 0) + 1;
      }
    });

    const topUtmSources = Object.entries(utmSourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUtmMediums = Object.entries(utmMediumCounts)
      .map(([medium, count]) => ({ medium, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUtmCampaigns = Object.entries(utmCampaignCounts)
      .map(([campaign, count]) => ({ campaign, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total_clicks: totalClicks || 0,
      unique_clicks: uniqueClicks,
      clicks_by_date: clicksByDateArray,
      top_referrers: topReferrers,
      clicks_by_country: clicksByCountry,
      utm_sources: topUtmSources,
      utm_mediums: topUtmMediums,
      utm_campaigns: topUtmCampaigns,
    };
  }
}

