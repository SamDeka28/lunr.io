import { NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { PlanService } from "@/lib/services/plan.service";

// GET /api/v1/links/[id]/analytics - Get analytics for a specific link
async function handleGet(
  _request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
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

    const planService = new PlanService(supabase);
    const retentionDays = await planService.getUserAnalyticsRetentionDays(userId);

    const analyticsService = new AnalyticsService(supabase);
    const stats = await analyticsService.getStats(id, { days: retentionDays });
    const recent = await analyticsService.getAnalytics(id, { days: retentionDays });

    return NextResponse.json({
      link_id: id,
      total_clicks: link.click_count,
      unique_clicks: stats.unique_clicks,
      clicks_by_date: Object.fromEntries(
        (stats.clicks_by_date || []).map((d) => [d.date, d.count])
      ),
      top_referrers: stats.top_referrers,
      clicks_by_country: stats.clicks_by_country,
      clicks_by_device: stats.clicks_by_device,
      clicks_by_browser: stats.clicks_by_browser,
      clicks_by_os: stats.clicks_by_os,
      retention_days: stats.retention_days,
      retention_truncated: stats.retention_truncated,
      recent_clicks:
        recent?.slice(0, 50).map((a) => ({
          clicked_at: a.clicked_at,
          referrer: a.referrer,
          country: a.country,
          device_type: a.device_type,
          browser: a.browser,
          os: a.os,
          is_bot: a.is_bot,
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
