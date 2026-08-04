import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// DELETE /api/pages/[id]/domains/[domainId] - Remove a custom domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; domainId: string }> }
) {
  try {
    const { id, domainId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the domain to verify ownership
    const { data: domain, error: domainError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("page_id", id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Delete the domain
    const { error: deleteError } = await supabase
      .from("custom_domains")
      .delete()
      .eq("id", domainId);

    if (deleteError) {
      throw new Error(`Failed to delete domain: ${deleteError.message}`);
    }

    // If this was the active domain, clear it from the page
    if (page.custom_domain_id === domainId) {
      await supabase
        .from("pages")
        .update({ custom_domain_id: null })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete domain" },
      { status: 500 }
    );
  }
}
