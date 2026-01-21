import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/lib/services/page.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/pages/slug/[slug] - Get a page by slug (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const pageService = new PageService();
    const page = await pageService.getPageBySlug(params.slug);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Track view
    await pageService.trackView(page.id);

    return NextResponse.json({ page });
  } catch (error: any) {
    console.error("Error fetching page by slug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}

