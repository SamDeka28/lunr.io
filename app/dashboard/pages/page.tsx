import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { PagesPageClient } from "./pages-page-client";
import Link from "next/link";

export default async function PagesPage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string; view?: string; status?: string; dateFilter?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const statusFilter = searchParams.status || "active";
  const dateFilter = searchParams.dateFilter;

  // Get user's pages
  let query = supabase
    .from("pages")
    .select("*")
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
      `slug.ilike.%${searchParams.search}%,title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    );
  }

  const { data: pages } = await query;

  // Check user limits using PlanService
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);
  const canUsePages = await planService.canUsePages(user.id);
  
  const pageCount = pages?.length || 0;
  const canCreatePage = limits.can_create_page && canUsePages;

  return (
    <DashboardContainer>
      <PageHeader
        title="Your Pages"
        description={
          canUsePages
            ? `${pageCount} / ${limits.max_pages === -1 ? "∞" : limits.max_pages} pages used`
            : "Pages feature requires Pro plan or higher"
        }
        actions={
          canCreatePage ? (
            <Link href="/dashboard/pages/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </Link>
          ) : undefined
        }
      />

      <PagesPageClient
        pages={pages || []}
        canCreate={canCreatePage}
        initialSearch={searchParams.search}
        initialView={(searchParams.view as any) || "list"}
        initialStatus={(searchParams.status as any) || "active"}
        initialDateFilter={searchParams.dateFilter}
      />
    </DashboardContainer>
  );
}

