// API Route for Link Statistics
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { PlanService } from "@/lib/services/plan.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const planService = new PlanService(supabase);
    const retentionDays = await planService.getUserAnalyticsRetentionDays(
      user.id
    );

    const analyticsService = new AnalyticsService(supabase);
    const stats = await analyticsService.getStats(id, { days: retentionDays });

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
