import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  OverviewAnalyticsService,
  defaultOverviewRange,
  type OverviewSource,
} from "@/lib/services/overview-analytics.service";
import { PlanService } from "@/lib/services/plan.service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planService = new PlanService(supabase);
    const retentionDays = await planService.getUserAnalyticsRetentionDays(user.id);
    const defaults = defaultOverviewRange(retentionDays);

    const from = searchParams.get("from") || defaults.from;
    const to = searchParams.get("to") || defaults.to;
    const source = (searchParams.get("source") || "all") as OverviewSource;
    const compare = searchParams.get("compare") !== "0";

    const service = new OverviewAnalyticsService(supabase);
    const overview = await service.getOverview(user.id, {
      from,
      to,
      campaignId: searchParams.get("campaignId") || undefined,
      tag: searchParams.get("tag") || undefined,
      folder: searchParams.get("folder") || undefined,
      linkId: searchParams.get("linkId") || undefined,
      country: searchParams.get("country") || undefined,
      device: searchParams.get("device") || undefined,
      includeBots: searchParams.get("bots") === "1",
      source,
      compare,
    });

    return NextResponse.json(overview);
  } catch (error: unknown) {
    console.error("[analytics/overview]", error);
    const message = error instanceof Error ? error.message : "Failed to load analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
