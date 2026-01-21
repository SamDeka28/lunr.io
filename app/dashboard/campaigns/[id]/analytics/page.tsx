import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignAnalyticsClient } from "./analytics-client";

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Get campaign with stats
  const { CampaignService } = await import("@/lib/services/campaign.service");
  const campaignService = new CampaignService(supabase);
  const campaign = await campaignService.getCampaignWithStats(id, user.id);

  if (!campaign) {
    redirect("/dashboard/campaigns");
  }

  // Get campaign links
  const links = await campaignService.getCampaignLinks(id, user.id);

  // Get analytics for all links in campaign
  const linkIds = links.map((l) => l.id);
  let clicksByDate: { [key: string]: number } = {};
  let topReferrers: { [key: string]: number } = {};
  let clicksByCountry: { [key: string]: number } = {};
  let clicksByDevice: { [key: string]: number } = {};
  let clicksByBrowser: { [key: string]: number } = {};
  let clicksByHour: { [key: number]: number } = {};
  let clicksByDayOfWeek: { [key: number]: number } = {};
  let todayClicks = 0;
  let yesterdayClicks = 0;
  let thisWeekClicks = 0;
  let lastWeekClicks = 0;

  if (linkIds.length > 0) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analytics } = await supabase
      .from("analytics")
      .select("*")
      .in("link_id", linkIds)
      .gte("clicked_at", thirtyDaysAgo.toISOString())
      .order("clicked_at", { ascending: false });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    // Process analytics
    analytics?.forEach((item) => {
      const clickDate = new Date(item.clicked_at);
      
      // Clicks by date
      const date = clickDate.toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // Today vs Yesterday
      if (clickDate >= today) {
        todayClicks++;
      } else if (clickDate >= yesterday && clickDate < today) {
        yesterdayClicks++;
      }

      // This week vs Last week
      if (clickDate >= thisWeekStart) {
        thisWeekClicks++;
      } else if (clickDate >= lastWeekStart && clickDate < thisWeekStart) {
        lastWeekClicks++;
      }

      // Clicks by hour
      const hour = clickDate.getHours();
      clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;

      // Clicks by day of week (0 = Sunday, 6 = Saturday)
      const dayOfWeek = clickDate.getDay();
      clicksByDayOfWeek[dayOfWeek] = (clicksByDayOfWeek[dayOfWeek] || 0) + 1;

      // Process referrers
      if (item.referrer) {
        const referrer = item.referrer === "Direct" || !item.referrer
          ? "Direct"
          : new URL(item.referrer).hostname.replace("www.", "");
        topReferrers[referrer] = (topReferrers[referrer] || 0) + 1;
      } else {
        topReferrers["Direct"] = (topReferrers["Direct"] || 0) + 1;
      }

      // Process countries
      if (item.country) {
        clicksByCountry[item.country] = (clicksByCountry[item.country] || 0) + 1;
      }

      // Process devices
      if (item.user_agent) {
        const ua = item.user_agent.toLowerCase();
        let device = "Unknown";
        if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
          device = "Mobile";
        } else if (ua.includes("tablet") || ua.includes("ipad")) {
          device = "Tablet";
        } else {
          device = "Desktop";
        }
        clicksByDevice[device] = (clicksByDevice[device] || 0) + 1;
      }

      // Process browsers
      if (item.user_agent) {
        const ua = item.user_agent.toLowerCase();
        let browser = "Unknown";
        if (ua.includes("chrome") && !ua.includes("edg")) {
          browser = "Chrome";
        } else if (ua.includes("firefox")) {
          browser = "Firefox";
        } else if (ua.includes("safari") && !ua.includes("chrome")) {
          browser = "Safari";
        } else if (ua.includes("edg")) {
          browser = "Edge";
        } else if (ua.includes("opera") || ua.includes("opr")) {
          browser = "Opera";
        }
        clicksByBrowser[browser] = (clicksByBrowser[browser] || 0) + 1;
      }
    });
  }

  const clicksByDateArray = Object.entries(clicksByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const topReferrersArray = Object.entries(topReferrers)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const clicksByCountryArray = Object.entries(clicksByCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const clicksByDeviceArray = Object.entries(clicksByDevice)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const clicksByBrowserArray = Object.entries(clicksByBrowser)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const clicksByHourArray = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: clicksByHour[i] || 0,
  }));

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const clicksByDayOfWeekArray = Array.from({ length: 7 }, (_, i) => ({
    day: dayNames[i],
    count: clicksByDayOfWeek[i] || 0,
  }));

  return (
    <CampaignAnalyticsClient
      campaign={campaign}
      links={links}
      clicksByDate={clicksByDateArray}
      topReferrers={topReferrersArray}
      clicksByCountry={clicksByCountryArray}
      clicksByDevice={clicksByDeviceArray}
      clicksByBrowser={clicksByBrowserArray}
      clicksByHour={clicksByHourArray}
      clicksByDayOfWeek={clicksByDayOfWeekArray}
      todayClicks={todayClicks}
      yesterdayClicks={yesterdayClicks}
      thisWeekClicks={thisWeekClicks}
      lastWeekClicks={lastWeekClicks}
    />
  );
}

