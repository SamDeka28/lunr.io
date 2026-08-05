import type { SupabaseClient } from "@supabase/supabase-js";
import { PlanService } from "@/lib/services/plan.service";
import { WebhookService } from "@/lib/services/webhook.service";

export type OverviewSource = "all" | "links" | "qr" | "pages";

export interface OverviewQuery {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  campaignId?: string;
  tag?: string;
  folder?: string;
  linkId?: string;
  country?: string;
  device?: string;
  includeBots?: boolean;
  source?: OverviewSource;
  compare?: boolean;
}

export interface NameCount {
  name: string;
  count: number;
}

export interface OverviewResult {
  retentionDays: number;
  hasOlderData: boolean;
  range: { from: string; to: string; days: number };
  previousRange: { from: string; to: string };
  summary: {
    clicks: number;
    uniqueClicks: number;
    prevClicks: number;
    prevUniqueClicks: number;
    clicksChangePct: number | null;
    linkCount: number;
    pageViews: number;
    pageClicks: number;
    qrScans: number;
    prevPageViews: number;
    prevPageClicks: number;
    prevQrScans: number;
  };
  clicksByDate: Array<{ date: string; count: number; previous: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  clicksByCountry: Array<{ country: string; count: number }>;
  clicksByDevice: Array<{ device: string; count: number }>;
  clicksByBrowser: Array<{ browser: string; count: number }>;
  clicksByOs: Array<{ os: string; count: number }>;
  utmSources: Array<{ source: string; count: number }>;
  utmMediums: Array<{ medium: string; count: number }>;
  utmCampaigns: Array<{ campaign: string; count: number }>;
  topLinks: Array<{
    id: string;
    short_code: string;
    title: string | null;
    original_url: string;
    clicks: number;
  }>;
  topPages: Array<{
    id: string;
    slug: string;
    title: string | null;
    views: number;
    clicks: number;
  }>;
  recentActivity: Array<{
    id: string;
    at: string;
    type: "click" | "qr" | "page_view" | "page_click";
    label: string;
    href: string | null;
    country: string | null;
    device: string | null;
    referrer: string | null;
  }>;
  alert: {
    enabled: boolean;
    triggered: boolean;
    message: string | null;
    todayClicks: number;
    baselineAvg: number;
    multiplier: number;
  };
  filterOptions: {
    campaigns: Array<{ id: string; name: string }>;
    tags: string[];
    folders: string[];
    countries: string[];
    devices: string[];
    links: Array<{ id: string; short_code: string; title: string | null }>;
  };
}

type LinkRow = {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  click_count: number;
  campaign_id: string | null;
  tags: string[] | null;
  folder: string | null;
};

type AnalyticsRow = {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address: string | null;
  referrer: string | null;
  country: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

type PageAnalyticsRow = {
  id: string;
  page_id: string;
  event_type: "view" | "click";
  referrer: string | null;
  country: string | null;
  created_at: string;
};

function parseDateOnly(value: string): Date {
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return d;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function hostFromReferrer(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "") || "Direct";
  } catch {
    return "Direct";
  }
}

function sortCountMap(map: Record<string, number>, limit = 10) {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function fillSeries(
  sparse: Record<string, number>,
  from: Date,
  to: Date,
  previousSparse?: Record<string, number>,
  previousFrom?: Date
): Array<{ date: string; count: number; previous: number }> {
  const result: Array<{ date: string; count: number; previous: number }> = [];
  const days = daysBetween(from, to);
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i);
    const key = toDateKey(d);
    let previous = 0;
    if (previousSparse && previousFrom) {
      const prevKey = toDateKey(addDays(previousFrom, i));
      previous = previousSparse[prevKey] || 0;
    }
    result.push({ date: key, count: sparse[key] || 0, previous });
  }
  return result;
}

function isQrScan(row: AnalyticsRow): boolean {
  const medium = (row.utm_medium || "").toLowerCase();
  const source = (row.utm_source || "").toLowerCase();
  return medium === "qr" || source === "qr";
}

export class OverviewAnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  async getOverview(userId: string, query: OverviewQuery): Promise<OverviewResult> {
    const planService = new PlanService(this.supabase);
    const retentionDays = await planService.getUserAnalyticsRetentionDays(userId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let from = parseDateOnly(query.from);
    let to = parseDateOnly(query.to);
    if (to < from) {
      const tmp = from;
      from = to;
      to = tmp;
    }

    // Clamp to retention window
    if (retentionDays >= 0) {
      const earliest = addDays(today, -retentionDays);
      if (from < earliest) from = earliest;
      if (to > today) to = today;
      if (to < from) to = from;
    }

    const rangeDays = daysBetween(from, to);
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -(rangeDays - 1));

    const fromIso = from.toISOString();
    const toEnd = new Date(to);
    toEnd.setUTCHours(23, 59, 59, 999);
    const toIso = toEnd.toISOString();
    const prevFromIso = prevFrom.toISOString();
    const prevToEnd = new Date(prevTo);
    prevToEnd.setUTCHours(23, 59, 59, 999);
    const prevToIso = prevToEnd.toISOString();

    const source = query.source || "all";
    const compare = query.compare !== false;

    // Links + filter options
    const { data: allLinks } = await this.supabase
      .from("links")
      .select("id, short_code, original_url, title, click_count, campaign_id, tags, folder")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("click_count", { ascending: false });

    const links = (allLinks || []) as LinkRow[];
    const linkById = new Map(links.map((l) => [l.id, l]));

    let filteredLinks = links;
    if (query.campaignId) {
      filteredLinks = filteredLinks.filter((l) => l.campaign_id === query.campaignId);
    }
    if (query.tag) {
      filteredLinks = filteredLinks.filter((l) => (l.tags || []).includes(query.tag!));
    }
    if (query.folder) {
      filteredLinks = filteredLinks.filter((l) => l.folder === query.folder);
    }
    if (query.linkId) {
      filteredLinks = filteredLinks.filter((l) => l.id === query.linkId);
    }

    const linkIds = filteredLinks.map((l) => l.id);

    const { data: campaigns } = await this.supabase
      .from("campaigns")
      .select("id, name")
      .eq("user_id", userId)
      .order("name");

    const tags = Array.from(
      new Set(links.flatMap((l) => l.tags || []).filter(Boolean))
    ).sort();
    const folders = Array.from(
      new Set(links.map((l) => l.folder).filter((f): f is string => !!f))
    ).sort();

    // Fetch analytics for current + previous windows in one wider query when possible
    let currentRows: AnalyticsRow[] = [];
    let previousRows: AnalyticsRow[] = [];
    let hasOlderData = false;

    if (linkIds.length > 0 && source !== "pages") {
      const fetchFrom = compare ? prevFromIso : fromIso;
      let q = this.supabase
        .from("analytics")
        .select(
          "id, link_id, clicked_at, ip_address, referrer, country, device_type, browser, os, utm_source, utm_medium, utm_campaign"
        )
        .in("link_id", linkIds)
        .gte("clicked_at", fetchFrom)
        .lte("clicked_at", toIso)
        .order("clicked_at", { ascending: false })
        .limit(50000);

      if (!query.includeBots) {
        q = q.eq("is_bot", false);
      }
      if (query.country) {
        q = q.eq("country", query.country);
      }
      if (query.device) {
        q = q.eq("device_type", query.device);
      }

      const { data } = await q;
      const rows = (data || []) as AnalyticsRow[];

      for (const row of rows) {
        const t = new Date(row.clicked_at).getTime();
        if (t >= from.getTime() && t <= toEnd.getTime()) {
          currentRows.push(row);
        } else if (compare && t >= prevFrom.getTime() && t <= prevToEnd.getTime()) {
          previousRows.push(row);
        }
      }

      // QR / links source filter
      if (source === "qr") {
        currentRows = currentRows.filter(isQrScan);
        previousRows = previousRows.filter(isQrScan);
      } else if (source === "links") {
        currentRows = currentRows.filter((r) => !isQrScan(r));
        previousRows = previousRows.filter((r) => !isQrScan(r));
      }

      if (retentionDays >= 0) {
        const { count } = await this.supabase
          .from("analytics")
          .select("*", { count: "exact", head: true })
          .in("link_id", linkIds)
          .eq("is_bot", false)
          .lt("clicked_at", fromIso);
        hasOlderData = (count || 0) > 0;
      }
    }

    // Page analytics
    const { data: pages } = await this.supabase
      .from("pages")
      .select("id, slug, title")
      .eq("user_id", userId);

    const pageList = pages || [];
    const pageById = new Map(pageList.map((p) => [p.id, p]));
    const pageIds = pageList.map((p) => p.id);

    let pageCurrent: PageAnalyticsRow[] = [];
    let pagePrevious: PageAnalyticsRow[] = [];

    if (pageIds.length > 0 && (source === "all" || source === "pages")) {
      const fetchFrom = compare ? prevFromIso : fromIso;
      let pq = this.supabase
        .from("page_analytics")
        .select("id, page_id, event_type, referrer, country, created_at")
        .in("page_id", pageIds)
        .gte("created_at", fetchFrom)
        .lte("created_at", toIso)
        .order("created_at", { ascending: false })
        .limit(20000);

      if (query.country) {
        pq = pq.eq("country", query.country);
      }

      const { data: pageRows } = await pq;
      for (const row of (pageRows || []) as PageAnalyticsRow[]) {
        const t = new Date(row.created_at).getTime();
        if (t >= from.getTime() && t <= toEnd.getTime()) {
          pageCurrent.push(row);
        } else if (compare && t >= prevFrom.getTime() && t <= prevToEnd.getTime()) {
          pagePrevious.push(row);
        }
      }
    }

    // Aggregate link clicks
    const clicksByDate: Record<string, number> = {};
    const prevClicksByDate: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const oses: Record<string, number> = {};
    const utmSources: Record<string, number> = {};
    const utmMediums: Record<string, number> = {};
    const utmCampaigns: Record<string, number> = {};
    const linkClickCounts: Record<string, number> = {};
    const uniqueKeys = new Set<string>();
    const prevUniqueKeys = new Set<string>();

    let qrScans = 0;
    let prevQrScans = 0;

    for (const row of currentRows) {
      const day = toDateKey(new Date(row.clicked_at));
      clicksByDate[day] = (clicksByDate[day] || 0) + 1;
      linkClickCounts[row.link_id] = (linkClickCounts[row.link_id] || 0) + 1;
      if (row.ip_address) uniqueKeys.add(`${row.ip_address}|${day}`);

      referrers[hostFromReferrer(row.referrer)] =
        (referrers[hostFromReferrer(row.referrer)] || 0) + 1;
      if (row.country) countries[row.country] = (countries[row.country] || 0) + 1;
      if (row.device_type) devices[row.device_type] = (devices[row.device_type] || 0) + 1;
      if (row.browser) browsers[row.browser] = (browsers[row.browser] || 0) + 1;
      if (row.os) oses[row.os] = (oses[row.os] || 0) + 1;
      if (row.utm_source) utmSources[row.utm_source] = (utmSources[row.utm_source] || 0) + 1;
      if (row.utm_medium) utmMediums[row.utm_medium] = (utmMediums[row.utm_medium] || 0) + 1;
      if (row.utm_campaign)
        utmCampaigns[row.utm_campaign] = (utmCampaigns[row.utm_campaign] || 0) + 1;
      if (isQrScan(row)) qrScans += 1;
    }

    for (const row of previousRows) {
      const day = toDateKey(new Date(row.clicked_at));
      prevClicksByDate[day] = (prevClicksByDate[day] || 0) + 1;
      if (row.ip_address) prevUniqueKeys.add(`${row.ip_address}|${day}`);
      if (isQrScan(row)) prevQrScans += 1;
    }

    // Page aggregates
    const pageViewCounts: Record<string, number> = {};
    const pageClickCounts: Record<string, number> = {};
    let pageViews = 0;
    let pageClicks = 0;
    let prevPageViews = 0;
    let prevPageClicks = 0;

    for (const row of pageCurrent) {
      if (row.event_type === "view") {
        pageViews += 1;
        pageViewCounts[row.page_id] = (pageViewCounts[row.page_id] || 0) + 1;
        if (source === "pages") {
          const day = toDateKey(new Date(row.created_at));
          clicksByDate[day] = (clicksByDate[day] || 0) + 1;
          if (row.country) countries[row.country] = (countries[row.country] || 0) + 1;
          referrers[hostFromReferrer(row.referrer)] =
            (referrers[hostFromReferrer(row.referrer)] || 0) + 1;
        }
      } else {
        pageClicks += 1;
        pageClickCounts[row.page_id] = (pageClickCounts[row.page_id] || 0) + 1;
      }
    }
    for (const row of pagePrevious) {
      if (row.event_type === "view") prevPageViews += 1;
      else prevPageClicks += 1;
      if (source === "pages") {
        const day = toDateKey(new Date(row.created_at));
        prevClicksByDate[day] = (prevClicksByDate[day] || 0) + 1;
      }
    }

    const clicks = currentRows.length;
    const prevClicks = previousRows.length;
    const uniqueClicks = uniqueKeys.size;
    const prevUniqueClicks = prevUniqueKeys.size;

    // Recent activity (merge top 40)
    const recentActivity: OverviewResult["recentActivity"] = [];
    for (const row of currentRows.slice(0, 30)) {
      const link = linkById.get(row.link_id);
      recentActivity.push({
        id: row.id,
        at: row.clicked_at,
        type: isQrScan(row) ? "qr" : "click",
        label: link ? `/${link.short_code}` : "Link click",
        href: link ? `/dashboard/links/${link.id}/analytics` : null,
        country: row.country,
        device: row.device_type,
        referrer: hostFromReferrer(row.referrer),
      });
    }
    for (const row of pageCurrent.slice(0, 20)) {
      const page = pageById.get(row.page_id);
      recentActivity.push({
        id: row.id,
        at: row.created_at,
        type: row.event_type === "view" ? "page_view" : "page_click",
        label: page ? `/${page.slug}` : "Page",
        href: page ? `/dashboard/pages/${page.id}/analytics` : null,
        country: row.country,
        device: null,
        referrer: hostFromReferrer(row.referrer),
      });
    }
    recentActivity.sort((a, b) => b.at.localeCompare(a.at));
    const recentTrimmed = recentActivity.slice(0, 25);

    // Top links by window clicks
    const topLinks = Object.entries(linkClickCounts)
      .map(([id, clickN]) => {
        const link = linkById.get(id);
        if (!link) return null;
        return {
          id: link.id,
          short_code: link.short_code,
          title: link.title,
          original_url: link.original_url,
          clicks: clickN,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.clicks - a!.clicks)
      .slice(0, 10) as OverviewResult["topLinks"];

    const topPages = pageList
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        views: pageViewCounts[p.id] || 0,
        clicks: pageClickCounts[p.id] || 0,
      }))
      .filter((p) => p.views > 0 || p.clicks > 0)
      .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
      .slice(0, 8);

    // Spike alert
    const alert = await this.evaluateAlert(userId, clicksByDate, today);

    // Time series from raw events (accurate). Refresh daily rollups in the background.
    const series = fillSeries(
      clicksByDate,
      from,
      to,
      compare ? prevClicksByDate : undefined,
      compare ? prevFrom : undefined
    );

    if (linkIds.length > 0) {
      void this.refreshRollups(userId, linkIds, from, to).catch(() => {});
    }

    const countryOptions = Object.keys(countries).sort();
    const deviceOptions = Object.keys(devices).sort();

    // Also surface known countries/devices from a light sample if empty
    if (countryOptions.length === 0 || deviceOptions.length === 0) {
      // leave empty — client can still work
    }

    return {
      retentionDays,
      hasOlderData,
      range: {
        from: toDateKey(from),
        to: toDateKey(to),
        days: rangeDays,
      },
      previousRange: {
        from: toDateKey(prevFrom),
        to: toDateKey(prevTo),
      },
      summary: {
        clicks: source === "pages" ? pageViews : clicks,
        uniqueClicks: source === "pages" ? pageViews : uniqueClicks,
        prevClicks: source === "pages" ? prevPageViews : prevClicks,
        prevUniqueClicks: source === "pages" ? prevPageViews : prevUniqueClicks,
        clicksChangePct: pctChange(
          source === "pages" ? pageViews : clicks,
          source === "pages" ? prevPageViews : prevClicks
        ),
        linkCount: filteredLinks.length,
        pageViews,
        pageClicks,
        qrScans,
        prevPageViews,
        prevPageClicks,
        prevQrScans,
      },
      clicksByDate: series,
      topReferrers: sortCountMap(referrers).map(({ name, count }) => ({
        referrer: name,
        count,
      })),
      clicksByCountry: sortCountMap(countries).map(({ name, count }) => ({
        country: name,
        count,
      })),
      clicksByDevice: sortCountMap(devices).map(({ name, count }) => ({
        device: name,
        count,
      })),
      clicksByBrowser: sortCountMap(browsers).map(({ name, count }) => ({
        browser: name,
        count,
      })),
      clicksByOs: sortCountMap(oses).map(({ name, count }) => ({
        os: name,
        count,
      })),
      utmSources: sortCountMap(utmSources).map(({ name, count }) => ({
        source: name,
        count,
      })),
      utmMediums: sortCountMap(utmMediums).map(({ name, count }) => ({
        medium: name,
        count,
      })),
      utmCampaigns: sortCountMap(utmCampaigns).map(({ name, count }) => ({
        campaign: name,
        count,
      })),
      topLinks,
      topPages,
      recentActivity: recentTrimmed,
      alert,
      filterOptions: {
        campaigns: (campaigns || []).map((c) => ({ id: c.id, name: c.name })),
        tags,
        folders,
        countries: countryOptions,
        devices: deviceOptions,
        links: links.slice(0, 200).map((l) => ({
          id: l.id,
          short_code: l.short_code,
          title: l.title,
        })),
      },
    };
  }

  private async evaluateAlert(
    userId: string,
    clicksByDate: Record<string, number>,
    today: Date
  ): Promise<OverviewResult["alert"]> {
    const defaultMultiplier = 2;
    let enabled = true;
    let multiplier = defaultMultiplier;
    let lastTriggered: string | null = null;

    try {
      const { data } = await this.supabase
        .from("analytics_alert_settings")
        .select("enabled, spike_multiplier, last_triggered_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        enabled = data.enabled !== false;
        multiplier = Number(data.spike_multiplier) || defaultMultiplier;
        lastTriggered = data.last_triggered_at;
      }
    } catch {
      // Table may not exist yet — use defaults
    }

    const todayKey = toDateKey(today);
    const todayClicks = clicksByDate[todayKey] || 0;

    // Baseline: average of previous 7 days (excluding today)
    let sum = 0;
    let n = 0;
    for (let i = 1; i <= 7; i++) {
      const key = toDateKey(addDays(today, -i));
      sum += clicksByDate[key] || 0;
      n += 1;
    }
    const baselineAvg = n > 0 ? sum / n : 0;
    const threshold = baselineAvg * multiplier;
    const triggered =
      enabled && baselineAvg >= 5 && todayClicks >= Math.max(threshold, baselineAvg + 10);

    if (triggered) {
      const alreadyToday =
        lastTriggered && toDateKey(new Date(lastTriggered)) === todayKey;
      if (!alreadyToday) {
        try {
          await this.supabase.from("analytics_alert_settings").upsert(
            {
              user_id: userId,
              enabled,
              spike_multiplier: multiplier,
              last_triggered_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
          const webhooks = new WebhookService(this.supabase);
          void webhooks.triggerWebhooks(userId, "analytics.spike", {
            today_clicks: todayClicks,
            baseline_avg: Math.round(baselineAvg * 10) / 10,
            multiplier,
            date: todayKey,
          });
        } catch {
          // ignore missing table / webhook failures
        }
      }
    }

    return {
      enabled,
      triggered,
      message: triggered
        ? `Traffic spike: ${todayClicks} clicks today vs ~${Math.round(baselineAvg)} daily avg`
        : null,
      todayClicks,
      baselineAvg: Math.round(baselineAvg * 10) / 10,
      multiplier,
    };
  }

  /** Best-effort upsert of daily rollups for the given range */
  async refreshRollups(
    userId: string,
    linkIds: string[],
    from: Date,
    to: Date
  ): Promise<void> {
    if (linkIds.length === 0) return;
    try {
      const toEnd = new Date(to);
      toEnd.setUTCHours(23, 59, 59, 999);
      const { data } = await this.supabase
        .from("analytics")
        .select("clicked_at, link_id, ip_address, utm_medium, utm_source")
        .in("link_id", linkIds)
        .eq("is_bot", false)
        .gte("clicked_at", from.toISOString())
        .lte("clicked_at", toEnd.toISOString())
        .limit(50000);

      if (!data) return;

      const buckets: Record<
        string,
        { clicks: number; uniques: Set<string>; qr: number }
      > = {};

      for (const row of data) {
        const day = toDateKey(new Date(row.clicked_at));
        if (!buckets[day]) {
          buckets[day] = { clicks: 0, uniques: new Set(), qr: 0 };
        }
        buckets[day].clicks += 1;
        if (row.ip_address) buckets[day].uniques.add(row.ip_address);
        const medium = (row.utm_medium || "").toLowerCase();
        const source = (row.utm_source || "").toLowerCase();
        if (medium === "qr" || source === "qr") buckets[day].qr += 1;
      }

      const upserts = Object.entries(buckets).flatMap(([day, b]) => [
        {
          user_id: userId,
          day,
          source: "link",
          clicks: b.clicks,
          unique_clicks: b.uniques.size,
          updated_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          day,
          source: "qr",
          clicks: b.qr,
          unique_clicks: 0,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (upserts.length > 0) {
        await this.supabase.from("analytics_daily").upsert(upserts, {
          onConflict: "user_id,day,source",
        });
      }
    } catch {
      // rollups optional
    }
  }

  async getAlertSettings(userId: string) {
    try {
      const { data } = await this.supabase
        .from("analytics_alert_settings")
        .select("enabled, spike_multiplier, last_triggered_at")
        .eq("user_id", userId)
        .maybeSingle();
      return {
        enabled: data?.enabled !== false,
        spike_multiplier: Number(data?.spike_multiplier) || 2,
        last_triggered_at: data?.last_triggered_at || null,
      };
    } catch {
      return { enabled: true, spike_multiplier: 2, last_triggered_at: null };
    }
  }

  async updateAlertSettings(
    userId: string,
    input: { enabled?: boolean; spike_multiplier?: number }
  ) {
    const payload = {
      user_id: userId,
      enabled: input.enabled ?? true,
      spike_multiplier: input.spike_multiplier ?? 2,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from("analytics_alert_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select("enabled, spike_multiplier, last_triggered_at")
      .single();
    if (error) throw error;
    return data;
  }
}

export function defaultOverviewRange(retentionDays: number): {
  from: string;
  to: string;
} {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const span = retentionDays < 0 ? 30 : Math.min(30, retentionDays);
  const from = addDays(to, -(span - 1));
  return { from: toDateKey(from), to: toDateKey(to) };
}
