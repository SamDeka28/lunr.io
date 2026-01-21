import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinksPageClient } from "./links-page-client";
import { LinksPageWrapper } from "./links-page-wrapper";
import Link from "next/link";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string; view?: string; status?: string; dateFilter?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const statusFilter = searchParams.status || "active";
  const dateFilter = searchParams.dateFilter;

  // Get user's links with search, including active QR codes
  let query = supabase
    .from("links")
    .select("*, qr_codes(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Apply status filter
  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "archived") {
    query = query.eq("is_active", false);
  }
  // "all" shows everything, no filter needed

  // Apply date filter
  if (dateFilter) {
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "last7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "thismonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastmonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
        break;
      default:
        startDate = null as any;
    }
    
    if (dateFilter !== "lastmonth" && startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
  }

  if (searchParams.search) {
    query = query.or(
      `short_code.ilike.%${searchParams.search}%,original_url.ilike.%${searchParams.search}%,title.ilike.%${searchParams.search}%`
    );
  }

  const { data: links, error } = await query;

      // Check user limits using PlanService
      const { PlanService } = await import("@/lib/services/plan.service");
      const planService = new PlanService(supabase);
      const limits = await planService.getUsageLimits(user.id);
      
      const linkCount = links?.length || 0;
      const canCreateLink = limits.can_create_link;

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Your Links</h1>
            <p className="text-sm text-neutral-muted">
              {linkCount} / {limits.max_links === -1 ? "∞" : limits.max_links} links used
            </p>
          </div>
          {canCreateLink && (
            <Link
              href="/dashboard/links/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
            >
              <span className="text-lg">+</span>
              Create link
            </Link>
          )}
        </div>

        <LinksPageWrapper
          links={links || []}
          canCreate={canCreateLink}
          linkCount={linkCount}
          initialSearch={searchParams.search}
          initialView={(searchParams.view as any) || "list"}
          initialStatus={(searchParams.status as any) || "active"}
          initialDateFilter={searchParams.dateFilter}
        />
      </div>
    </div>
  );
}
