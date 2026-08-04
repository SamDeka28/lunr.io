// CSV export of analytics rows for a link (owner only)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(
  _request: NextRequest,
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
      .select("id, short_code")
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

    let query = supabase
      .from("analytics")
      .select(
        "clicked_at, ip_address, country, referrer, device_type, browser, os, is_bot, utm_source, utm_medium, utm_campaign, utm_term, utm_content, user_agent"
      )
      .eq("link_id", id)
      .order("clicked_at", { ascending: false });

    if (retentionDays >= 0) {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - retentionDays);
      query = query.gte("clicked_at", since.toISOString());
    }

    const { data: rows, error } = await query.limit(50000);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    const headers = [
      "clicked_at",
      "ip_address",
      "country",
      "referrer",
      "device_type",
      "browser",
      "os",
      "is_bot",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "user_agent",
    ];

    const lines = [headers.join(",")];
    for (const row of rows || []) {
      lines.push(
        headers.map((h) => csvEscape((row as Record<string, unknown>)[h])).join(",")
      );
    }

    const filename = `analytics-${link.short_code || id}.csv`;
    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export analytics" },
      { status: 500 }
    );
  }
}
