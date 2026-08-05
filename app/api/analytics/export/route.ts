import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";
import { defaultOverviewRange } from "@/lib/services/overview-analytics.service";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
    const campaignId = searchParams.get("campaignId") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const folder = searchParams.get("folder") || undefined;
    const linkId = searchParams.get("linkId") || undefined;
    const country = searchParams.get("country") || undefined;
    const device = searchParams.get("device") || undefined;
    const includeBots = searchParams.get("bots") === "1";
    const source = searchParams.get("source") || "all";

    let linksQuery = supabase
      .from("links")
      .select("id, short_code, title, campaign_id, tags, folder")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (campaignId) linksQuery = linksQuery.eq("campaign_id", campaignId);
    if (folder) linksQuery = linksQuery.eq("folder", folder);
    if (linkId) linksQuery = linksQuery.eq("id", linkId);

    const { data: links } = await linksQuery;
    let filtered = links || [];
    if (tag) {
      filtered = filtered.filter((l) => (l.tags || []).includes(tag));
    }
    const linkIds = filtered.map((l) => l.id);
    const linkMap = new Map(filtered.map((l) => [l.id, l]));

    if (linkIds.length === 0 || source === "pages") {
      // Export page analytics when source=pages or no links
      if (source === "pages" || source === "all") {
        const { data: pages } = await supabase
          .from("pages")
          .select("id, slug, title")
          .eq("user_id", user.id);
        const pageIds = (pages || []).map((p) => p.id);
        const pageMap = new Map((pages || []).map((p) => [p.id, p]));

        if (pageIds.length === 0 && source === "pages") {
          return new NextResponse("at,type,label,country,referrer\n", {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="analytics-${from}-to-${to}.csv"`,
            },
          });
        }

        if (source === "pages" && pageIds.length > 0) {
          let pq = supabase
            .from("page_analytics")
            .select("created_at, event_type, referrer, country, page_id")
            .in("page_id", pageIds)
            .gte("created_at", `${from}T00:00:00.000Z`)
            .lte("created_at", `${to}T23:59:59.999Z`)
            .order("created_at", { ascending: false })
            .limit(50000);
          if (country) pq = pq.eq("country", country);
          const { data: rows } = await pq;
          const headers = ["at", "type", "label", "country", "referrer"];
          const lines = [headers.join(",")];
          for (const row of rows || []) {
            const page = pageMap.get(row.page_id);
            lines.push(
              [
                csvEscape(row.created_at),
                csvEscape(row.event_type === "view" ? "page_view" : "page_click"),
                csvEscape(page ? `/${page.slug}` : ""),
                csvEscape(row.country),
                csvEscape(row.referrer),
              ].join(",")
            );
          }
          return new NextResponse(lines.join("\n"), {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="analytics-${from}-to-${to}.csv"`,
            },
          });
        }
      }

      if (linkIds.length === 0) {
        return new NextResponse(
          "clicked_at,short_code,title,country,referrer,device_type,browser,os,is_bot,utm_source,utm_medium,utm_campaign\n",
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="analytics-${from}-to-${to}.csv"`,
            },
          }
        );
      }
    }

    let query = supabase
      .from("analytics")
      .select(
        "clicked_at, link_id, country, referrer, device_type, browser, os, is_bot, utm_source, utm_medium, utm_campaign"
      )
      .in("link_id", linkIds)
      .gte("clicked_at", `${from}T00:00:00.000Z`)
      .lte("clicked_at", `${to}T23:59:59.999Z`)
      .order("clicked_at", { ascending: false })
      .limit(50000);

    if (!includeBots) query = query.eq("is_bot", false);
    if (country) query = query.eq("country", country);
    if (device) query = query.eq("device_type", device);

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filteredRows = rows || [];
    if (source === "qr") {
      filteredRows = filteredRows.filter(
        (r) =>
          (r.utm_medium || "").toLowerCase() === "qr" ||
          (r.utm_source || "").toLowerCase() === "qr"
      );
    } else if (source === "links") {
      filteredRows = filteredRows.filter(
        (r) =>
          (r.utm_medium || "").toLowerCase() !== "qr" &&
          (r.utm_source || "").toLowerCase() !== "qr"
      );
    }

    const headers = [
      "clicked_at",
      "short_code",
      "title",
      "country",
      "referrer",
      "device_type",
      "browser",
      "os",
      "is_bot",
      "utm_source",
      "utm_medium",
      "utm_campaign",
    ];
    const lines = [headers.join(",")];
    for (const row of filteredRows) {
      const link = linkMap.get(row.link_id);
      lines.push(
        [
          csvEscape(row.clicked_at),
          csvEscape(link?.short_code),
          csvEscape(link?.title),
          csvEscape(row.country),
          csvEscape(row.referrer),
          csvEscape(row.device_type),
          csvEscape(row.browser),
          csvEscape(row.os),
          csvEscape(row.is_bot),
          csvEscape(row.utm_source),
          csvEscape(row.utm_medium),
          csvEscape(row.utm_campaign),
        ].join(",")
      );
    }

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-${from}-to-${to}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("[analytics/export]", error);
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
