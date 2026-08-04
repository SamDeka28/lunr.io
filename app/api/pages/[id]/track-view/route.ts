import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// POST /api/pages/[id]/track-view - Track a page view (client-side fallback)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const supabase = await createClient();
    const pageService = new PageService(supabase);

    await pageService.trackView(id, {
      referrer:
        body.referrer ||
        request.headers.get("referer") ||
        request.headers.get("referrer") ||
        null,
      userAgent: request.headers.get("user-agent") || null,
      country: body.country || null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track view" },
      { status: 500 }
    );
  }
}
