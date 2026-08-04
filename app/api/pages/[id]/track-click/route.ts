import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// POST /api/pages/[id]/track-click - Track a click on a page link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const linkId: string | null = body.link_id || body.linkId || null;

    const supabase = await createClient();
    const pageService = new PageService(supabase);

    const referrer =
      body.referrer ||
      request.headers.get("referer") ||
      request.headers.get("referrer") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    await pageService.trackClick(id, {
      linkId,
      referrer,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking page click:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track click" },
      { status: 500 }
    );
  }
}
