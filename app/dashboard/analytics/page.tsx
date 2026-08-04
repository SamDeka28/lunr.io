import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { TrendingUp, Link2, Activity, Users, BarChart3 } from "lucide-react";
import { AnalyticsChartsLazy } from "./analytics-charts-lazy";
import { PlanService } from "@/lib/services/plan.service";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const planService = new PlanService(supabase);
  const retentionDays = await planService.getUserAnalyticsRetentionDays(user.id);
  const retentionTruncated = retentionDays >= 0;

  // Get all user's links with stats
  const { data: links } = await supabase
    .from("links")
    .select("id, short_code, original_url, click_count, created_at, title")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("click_count", { ascending: false });

  // Get total stats
  const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;
  const totalLinks = links?.length || 0;

  // Get analytics for all links within plan retention
  const linkIds = links?.map((l) => l.id) || [];
  let totalAnalytics = 0;
  let uniqueClicks = 0;
  let clicksByDate: { [key: string]: number } = {};
  let topReferrers: { [key: string]: number } = {};
  let clicksByCountry: { [key: string]: number } = {};
  let utmSources: { [key: string]: number } = {};
  let utmMediums: { [key: string]: number } = {};
  let utmCampaigns: { [key: string]: number } = {};
  let hasOlderData = false;

  if (linkIds.length > 0) {
    let query = supabase
      .from("analytics")
      .select("clicked_at, ip_address, referrer, country, utm_source, utm_medium, utm_campaign")
      .in("link_id", linkIds)
      .eq("is_bot", false)
      .order("clicked_at", { ascending: false });

    if (retentionDays >= 0) {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - retentionDays);
      const sinceIso = since.toISOString();
      query = query.gte("clicked_at", sinceIso);

      const { count } = await supabase
        .from("analytics")
        .select("*", { count: "exact", head: true })
        .in("link_id", linkIds)
        .eq("is_bot", false)
        .lt("clicked_at", sinceIso);
      hasOlderData = (count || 0) > 0;
    }

    const { data: analytics } = await query;

    totalAnalytics = analytics?.length || 0;

    // Unique = distinct IP within a 24h UTC calendar-day window
    const uniqueKeys = new Set<string>();
    analytics?.forEach((a) => {
      if (!a.ip_address) return;
      const day = new Date(a.clicked_at).toISOString().slice(0, 10);
      uniqueKeys.add(`${a.ip_address}|${day}`);
    });
    uniqueClicks = uniqueKeys.size;

    analytics?.forEach((item) => {
      const date = new Date(item.clicked_at).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      if (item.referrer) {
        try {
          const referrer = new URL(item.referrer).hostname.replace("www.", "");
          topReferrers[referrer] = (topReferrers[referrer] || 0) + 1;
        } catch {
          topReferrers["Direct"] = (topReferrers["Direct"] || 0) + 1;
        }
      } else {
        topReferrers["Direct"] = (topReferrers["Direct"] || 0) + 1;
      }

      if (item.country) {
        clicksByCountry[item.country] = (clicksByCountry[item.country] || 0) + 1;
      }

      if (item.utm_source) {
        utmSources[item.utm_source] = (utmSources[item.utm_source] || 0) + 1;
      }
      if (item.utm_medium) {
        utmMediums[item.utm_medium] = (utmMediums[item.utm_medium] || 0) + 1;
      }
      if (item.utm_campaign) {
        utmCampaigns[item.utm_campaign] = (utmCampaigns[item.utm_campaign] || 0) + 1;
      }
    });
  }

  const clicksByDateArray = Object.entries(clicksByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topReferrersArray = Object.entries(topReferrers)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const clicksByCountryArray = Object.entries(clicksByCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const utmSourcesArray = Object.entries(utmSources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const utmMediumsArray = Object.entries(utmMediums)
    .map(([medium, count]) => ({ medium, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const utmCampaignsArray = Object.entries(utmCampaigns)
    .map(([campaign, count]) => ({ campaign, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgPerLink = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;
  const retentionLabel =
    retentionDays < 0 ? "Unlimited history" : `Last ${retentionDays} days`;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader
        title="Analytics Overview"
        description={`Track performance across all your links · ${retentionLabel}`}
      />
      {retentionTruncated && hasOlderData && (
        <div className="mb-8 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
          Charts show the last {retentionDays} days for your plan. Older analytics exist but
          are not included — upgrade for a longer window.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Links"
          value={totalLinks.toLocaleString()}
          icon={<Link2 className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          hint={`${totalAnalytics.toLocaleString()} in window`}
        />
        <StatCard
          label="Unique Clicks"
          value={uniqueClicks.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Avg. per Link"
          value={avgPerLink.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <AnalyticsChartsLazy
        clicksByDate={clicksByDateArray}
        topReferrers={topReferrersArray}
        clicksByCountry={clicksByCountryArray}
        utmSources={utmSourcesArray}
        utmMediums={utmMediumsArray}
        utmCampaigns={utmCampaignsArray}
      />

      {/* Top Performing Links */}
      {links && links.length > 0 && (
        <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-electric-sapphire" />
            </div>
            <h2 className="text-xl font-bold text-neutral-text">Top Performing Links</h2>
          </div>
          <div className="space-y-3">
            {links.slice(0, 10).map((link, index) => {
              const displayTitle = link.title || (() => {
                try {
                  if (link.original_url) {
                    return `${new URL(link.original_url).hostname} - untitled`;
                  }
                } catch {
                  // Invalid URL
                }
                return "untitled";
              })();

              return (
                <Link
                  key={link.id}
                  href={`/dashboard/links/${link.id}/analytics`}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-bg border border-neutral-border hover:bg-gradient-to-r hover:from-electric-sapphire/5 hover:to-bright-indigo/5 hover:border-electric-sapphire/20 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-colors">
                        <span className="text-xs font-bold text-electric-sapphire">{index + 1}</span>
                      </div>
                      <div className="font-mono text-sm text-electric-sapphire font-semibold group-hover:text-bright-indigo transition-colors">
                        /{link.short_code}
                      </div>
                    </div>
                    <div className="text-sm text-neutral-muted truncate max-w-md ml-10">
                      {displayTitle}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-neutral-text group-hover:text-electric-sapphire transition-colors">
                      {link.click_count || 0}
                    </div>
                    <div className="text-xs text-neutral-muted">clicks</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {(!links || links.length === 0) && (
        <div className="bg-white rounded-card shadow-soft border border-neutral-border p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-electric-sapphire/60" />
          </div>
          <h3 className="text-xl font-bold text-neutral-text mb-2">
            No analytics data yet
          </h3>
          <p className="text-sm text-neutral-muted mb-6 max-w-md mx-auto">
            Create and share your first link to start tracking analytics.
          </p>
          <Link
            href="/dashboard/links/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
          >
            <Link2 className="h-4 w-4" />
            Create Your First Link
          </Link>
        </div>
      )}
    </div>
  );
}
