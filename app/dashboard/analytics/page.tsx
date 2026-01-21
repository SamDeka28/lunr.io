import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, Globe, Clock, Link2, Activity, Users, MapPin } from "lucide-react";
import { AnalyticsCharts } from "./analytics-charts";
import Link from "next/link";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  // Get analytics for all links
  const linkIds = links?.map((l) => l.id) || [];
  let totalAnalytics = 0;
  let uniqueClicks = 0;
  let clicksByDate: { [key: string]: number } = {};
  let topReferrers: { [key: string]: number } = {};
  let clicksByCountry: { [key: string]: number } = {};
  let utmSources: { [key: string]: number } = {};
  let utmMediums: { [key: string]: number } = {};
  let utmCampaigns: { [key: string]: number } = {};

  if (linkIds.length > 0) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analytics } = await supabase
      .from("analytics")
      .select("*")
      .in("link_id", linkIds)
      .gte("clicked_at", thirtyDaysAgo.toISOString())
      .order("clicked_at", { ascending: false });

    totalAnalytics = analytics?.length || 0;
    const uniqueIps = new Set(
      analytics?.filter((a) => a.ip_address).map((a) => a.ip_address) || []
    );
    uniqueClicks = uniqueIps.size;

    // Process clicks by date
    analytics?.forEach((item) => {
      const date = new Date(item.clicked_at).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    // Process referrers
    analytics?.forEach((item) => {
      if (item.referrer) {
        const referrer = item.referrer === "Direct" || !item.referrer
          ? "Direct"
          : new URL(item.referrer).hostname.replace("www.", "");
        topReferrers[referrer] = (topReferrers[referrer] || 0) + 1;
      } else {
        topReferrers["Direct"] = (topReferrers["Direct"] || 0) + 1;
      }
    });

    // Process countries
    analytics?.forEach((item) => {
      if (item.country) {
        clicksByCountry[item.country] = (clicksByCountry[item.country] || 0) + 1;
      }
    });

    // Process UTM parameters (aggregated across all links)
    analytics?.forEach((item) => {
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
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

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

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-text mb-3">Analytics Overview</h1>
        <p className="text-lg text-neutral-muted">
          Track performance across all your links
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-electric-sapphire to-bright-indigo p-6 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Link2 className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white/80 mb-1">Total Links</p>
            <p className="text-3xl font-bold">{totalLinks.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neon-pink to-raspberry-plum p-6 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white/80 mb-1">Total Clicks</p>
            <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-energy to-sky-aqua p-6 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white/80 mb-1">Unique Clicks</p>
            <p className="text-3xl font-bold">{uniqueClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vivid-royal to-indigo-bloom p-6 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white/80 mb-1">Avg. per Link</p>
            <p className="text-3xl font-bold">{avgPerLink.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
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
              const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.short_code}`;
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
