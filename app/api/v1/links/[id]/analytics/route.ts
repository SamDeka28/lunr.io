import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/links/[id]/analytics - Get analytics for a specific link
async function handleGet(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    // Verify ownership
    const { data: link } = await supabase
      .from("links")
      .select("id, click_count")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    // Get analytics data
    const { data: analytics } = await supabase
      .from("analytics")
      .select("*")
      .eq("link_id", id)
      .order("clicked_at", { ascending: false })
      .limit(1000); // Limit to last 1000 clicks

    // Calculate stats
    const uniqueIps = new Set(
      analytics?.filter((a) => a.ip_address).map((a) => a.ip_address) || []
    );

    // Group by date
    const clicksByDate: Record<string, number> = {};
    analytics?.forEach((item) => {
      const date = new Date(item.clicked_at).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    // Top referrers
    const referrers: Record<string, number> = {};
    analytics?.forEach((item) => {
      const referrer = item.referrer || "Direct";
      referrers[referrer] = (referrers[referrer] || 0) + 1;
    });

    // Countries
    const countries: Record<string, number> = {};
    analytics?.forEach((item) => {
      if (item.country) {
        countries[item.country] = (countries[item.country] || 0) + 1;
      }
    });

    return NextResponse.json({
      link_id: id,
      total_clicks: link.click_count,
      unique_clicks: uniqueIps.size,
      clicks_by_date: clicksByDate,
      top_referrers: Object.entries(referrers)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      clicks_by_country: Object.entries(countries)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recent_clicks: analytics?.slice(0, 50).map((a) => ({
        clicked_at: a.clicked_at,
        referrer: a.referrer,
        country: a.country,
        user_agent: a.user_agent,
      })) || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);

