import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeLeadCaptureConfig } from "@/lib/utils/lead-capture-config";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/links/[id]/leads
 * Owner-only list of captured emails. ?format=csv for download.
 */
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
      .select("id, short_code, lead_capture_enabled, lead_capture_config")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const config = normalizeLeadCaptureConfig(link.lead_capture_config);

    const { data: rows, error } = await supabase
      .from("link_email_captures")
      .select("id, email, name, responses, created_at")
      .eq("link_id", id)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch leads" },
        { status: 500 }
      );
    }

    const leads = rows || [];
    const format = request.nextUrl.searchParams.get("format");

    if (format === "csv") {
      const fieldHeaders = config.fields.map((f) => f.label);
      const headers = ["email", "name", ...fieldHeaders, "created_at"];
      const lines = [
        headers.join(","),
        ...leads.map((row) => {
          const responses = (row.responses || {}) as Record<
            string,
            string | boolean
          >;
          const fieldValues = config.fields.map((f) => {
            const v = responses[f.id];
            if (typeof v === "boolean") return v ? "true" : "false";
            return v ?? "";
          });
          return [row.email, row.name, ...fieldValues, row.created_at]
            .map(csvEscape)
            .join(",");
        }),
      ];
      const csv = lines.join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="leads-${link.short_code}.csv"`,
        },
      });
    }

    return NextResponse.json({
      leads,
      total: leads.length,
      lead_capture_enabled: link.lead_capture_enabled,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
