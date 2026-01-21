import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// GET /api/pages/[id] - Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(params.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ page });
  } catch (error: any) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// PATCH /api/pages/[id] - Update a page
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(params.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updatedPage = await pageService.updatePage(params.id, body);

    return NextResponse.json({ page: updatedPage });
  } catch (error: any) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update page" },
      { status: 400 }
    );
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(params.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pageService.deletePage(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}

