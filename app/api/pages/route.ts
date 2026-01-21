import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";
import { PlanService } from "@/lib/services/plan.service";

// GET /api/pages - Get all pages for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const pages = await pageService.getUserPages(user.id);

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check plan limits
    const planService = new PlanService(supabase);
    const limits = await planService.getUsageLimits(user.id);

    if (!limits.can_create_page) {
      return NextResponse.json(
        {
          error: `You've reached your limit of ${limits.max_pages === -1 ? "unlimited" : limits.max_pages} pages. Upgrade to create more.`,
        },
        { status: 403 }
      );
    }

    // Check if pages feature is enabled
    const canUsePages = await planService.canUsePages(user.id);
    if (!canUsePages) {
      return NextResponse.json(
        {
          error: "Pages feature is not available on your plan. Upgrade to access this feature.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slug, title, description, content, background_color, text_color, button_color, button_text_color, links, social_links, is_public } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Slug and title are required" },
        { status: 400 }
      );
    }

    const pageService = new PageService(supabase);
    const page = await pageService.createPage(user.id, {
      slug,
      title,
      description: description || null,
      content: content || {},
      background_color: background_color || "#FFFFFF",
      text_color: text_color || "#000000",
      button_color: button_color || "#3B82F6",
      button_text_color: button_text_color || "#FFFFFF",
      links: links || [],
      social_links: social_links || {},
      is_public: is_public !== undefined ? is_public : true,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create page" },
      { status: 400 }
    );
  }
}

