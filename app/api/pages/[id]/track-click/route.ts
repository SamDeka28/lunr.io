import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// POST /api/pages/[id]/track-click - Track a click on a page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const pageService = new PageService(supabase);
    
    await pageService.trackClick(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking page click:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track click" },
      { status: 500 }
    );
  }
}

