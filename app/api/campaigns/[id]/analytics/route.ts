import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignAnalyticsService } from "@/lib/services/campaign-analytics.service";
import { campaignsDisabledResponse } from "@/lib/features";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const disabled = campaignsDisabledResponse();
  if (disabled) return disabled;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const service = new CampaignAnalyticsService(supabase);
    const data = await service.getAnalytics(id, user.id, { from, to });

    if (format === "csv") {
      const rows = [
        ["type", "name", "platform", "clicks", "conversions", "spend", "cpa"].join(","),
        ...data.creatorLeaderboard.map((c) =>
          [
            "creator",
            JSON.stringify(c.display_name),
            c.platform,
            c.clicks,
            c.conversions,
            c.spend,
            c.cpa ?? "",
          ].join(",")
        ),
        ...data.linkLeaderboard.map((l) =>
          [
            "link",
            JSON.stringify(l.title || l.short_code),
            "",
            l.clicks,
            l.conversions,
            "",
            "",
          ].join(",")
        ),
      ];
      return new NextResponse(rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="campaign-${id}-analytics.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}
