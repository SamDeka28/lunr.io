import type { SupabaseClient } from "@supabase/supabase-js";
import { computeCpc } from "@/lib/utils/utm";

export type CampaignAnalyticsQuery = {
  from?: string;
  to?: string;
};

function startOfDayIso(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDayIso(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

export class CampaignAnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async getAnalytics(
    campaignId: string,
    userId: string,
    query: CampaignAnalyticsQuery = {}
  ) {
    const { data: campaign, error: campaignError } = await this.supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .maybeSingle();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);

    const fromIso = startOfDayIso(from);
    const toIso = endOfDayIso(to);

    const { data: links } = await this.supabase
      .from("links")
      .select("id, short_code, title, original_url, click_count, is_active")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    const linkIds = (links || []).map((l) => l.id);

    const { data: creators } = await this.supabase
      .from("campaign_creators")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    let analyticsRows: any[] = [];
    if (linkIds.length > 0) {
      const { data } = await this.supabase
        .from("analytics")
        .select(
          "link_id, clicked_at, ip_address, country, device_type, browser, referrer, is_bot, utm_source, utm_medium, utm_campaign, utm_content"
        )
        .in("link_id", linkIds)
        .gte("clicked_at", fromIso)
        .lte("clicked_at", toIso);
      analyticsRows = data || [];
    }

    const humanRows = analyticsRows.filter((r) => !r.is_bot);

    const clicksByDate: Record<string, number> = {};
    const clicksByCountry: Record<string, number> = {};
    const clicksByDevice: Record<string, number> = {};
    const topReferrers: Record<string, number> = {};
    const utmSources: Record<string, number> = {};
    const utmMediums: Record<string, number> = {};
    const utmCampaigns: Record<string, number> = {};
    const clicksByLink: Record<string, number> = {};
    const uniqueIps = new Set<string>();

    for (const row of humanRows) {
      const day = String(row.clicked_at).slice(0, 10);
      clicksByDate[day] = (clicksByDate[day] || 0) + 1;
      if (row.country) {
        clicksByCountry[row.country] = (clicksByCountry[row.country] || 0) + 1;
      }
      if (row.device_type) {
        clicksByDevice[row.device_type] =
          (clicksByDevice[row.device_type] || 0) + 1;
      }
      if (row.referrer) {
        try {
          const host = new URL(row.referrer).hostname;
          topReferrers[host] = (topReferrers[host] || 0) + 1;
        } catch {
          topReferrers[row.referrer] = (topReferrers[row.referrer] || 0) + 1;
        }
      }
      if (row.utm_source) {
        utmSources[row.utm_source] = (utmSources[row.utm_source] || 0) + 1;
      }
      if (row.utm_medium) {
        utmMediums[row.utm_medium] = (utmMediums[row.utm_medium] || 0) + 1;
      }
      if (row.utm_campaign) {
        utmCampaigns[row.utm_campaign] =
          (utmCampaigns[row.utm_campaign] || 0) + 1;
      }
      if (row.link_id) {
        clicksByLink[row.link_id] = (clicksByLink[row.link_id] || 0) + 1;
      }
      if (row.ip_address) uniqueIps.add(row.ip_address);
    }

    const { data: conversions } = await this.supabase
      .from("conversion_events")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .gte("occurred_at", fromIso)
      .lte("occurred_at", toIso);

    const conversionRows = conversions || [];
    const conversionsByLink: Record<string, number> = {};
    const conversionsByCreator: Record<string, number> = {};
    let revenue = 0;
    for (const c of conversionRows) {
      if (c.link_id) {
        conversionsByLink[c.link_id] = (conversionsByLink[c.link_id] || 0) + 1;
      }
      if (c.campaign_creator_id) {
        conversionsByCreator[c.campaign_creator_id] =
          (conversionsByCreator[c.campaign_creator_id] || 0) + 1;
      }
      if (c.value) revenue += Number(c.value);
    }

    const { data: spendRows } = await this.supabase
      .from("campaign_spend_entries")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId);

    const totalSpend = (spendRows || []).reduce(
      (s, e) => s + Number(e.amount || 0),
      0
    );
    const spendByCreator: Record<string, number> = {};
    for (const e of spendRows || []) {
      if (e.campaign_creator_id) {
        spendByCreator[e.campaign_creator_id] =
          (spendByCreator[e.campaign_creator_id] || 0) + Number(e.amount || 0);
      }
    }

    const totalClicks = humanRows.length;
    const totalConversions = conversionRows.length;
    const cpc =
      totalSpend > 0
        ? computeCpc(totalSpend, totalClicks)
        : computeCpc(Number(campaign.budget) || 0, totalClicks);
    const cpa =
      totalSpend > 0 && totalConversions > 0
        ? totalSpend / totalConversions
        : null;
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const creatorLeaderboard = (creators || []).map((creator) => {
      const clicks = creator.link_id
        ? clicksByLink[creator.link_id] || 0
        : 0;
      const conversionsCount = conversionsByCreator[creator.id] || 0;
      const spend =
        spendByCreator[creator.id] ||
        (creator.status === "paid" ? Number(creator.fee_amount || 0) : 0);
      return {
        id: creator.id,
        display_name: creator.display_name,
        handle: creator.handle,
        platform: creator.platform,
        status: creator.status,
        link_id: creator.link_id,
        clicks,
        conversions: conversionsCount,
        conversion_rate: clicks > 0 ? (conversionsCount / clicks) * 100 : 0,
        spend,
        cpa: spend > 0 && conversionsCount > 0 ? spend / conversionsCount : null,
      };
    }).sort((a, b) => b.clicks - a.clicks);

    const platformMix: Record<string, number> = {};
    for (const c of creatorLeaderboard) {
      platformMix[c.platform] = (platformMix[c.platform] || 0) + c.clicks;
    }

    const linkLeaderboard = (links || [])
      .map((link) => ({
        id: link.id,
        short_code: link.short_code,
        title: link.title,
        clicks: clicksByLink[link.id] || 0,
        conversions: conversionsByLink[link.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    const toSorted = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

    return {
      campaign,
      range: { from: fromIso, to: toIso },
      totals: {
        clicks: totalClicks,
        uniques: uniqueIps.size,
        links: linkIds.length,
        creators: (creators || []).length,
        conversions: totalConversions,
        conversion_rate: conversionRate,
        revenue,
        total_spend: totalSpend,
        planned_budget: Number(campaign.budget) || 0,
        cpc,
        cpa,
      },
      clicksByDate: Object.entries(clicksByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      clicksByCountry: toSorted(clicksByCountry),
      clicksByDevice: toSorted(clicksByDevice),
      topReferrers: toSorted(topReferrers).slice(0, 20),
      utmSources: toSorted(utmSources),
      utmMediums: toSorted(utmMediums),
      utmCampaigns: toSorted(utmCampaigns),
      creatorLeaderboard,
      platformMix: toSorted(platformMix),
      linkLeaderboard,
    };
  }
}
