import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { PagesPageClient } from "./pages-page-client";
import Link from "next/link";
import {
  parsePagination,
  paginationMeta,
} from "@/lib/utils/pagination";

export default async function PagesPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    filter?: string;
    view?: string;
    status?: string;
    dateFilter?: string;
    page?: string;
    pageSize?: string;
  };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const statusFilter = searchParams.status || "active";
  const dateFilter = searchParams.dateFilter;
  const { page, pageSize, from, to } = parsePagination(searchParams);

  let query = supabase
    .from("pages")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "archived") {
    query = query.eq("is_active", false);
  }

  if (dateFilter) {
    const now = new Date();
    let startDate: Date | null = null;

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
      case "lastmonth": {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
        startDate = null;
        break;
      }
      default:
        startDate = null;
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

  const { data: pages, count } = await query;
  const filteredTotal = count ?? 0;
  const pagination = paginationMeta(filteredTotal, page, pageSize);

  if (page > pagination.totalPages && filteredTotal > 0) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value != null && key !== "page") params.set(key, String(value));
    });
    if (pagination.totalPages > 1) params.set("page", String(pagination.totalPages));
    redirect(`/dashboard/pages?${params.toString()}`);
  }

  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);
  const canUsePages = await planService.canUsePages(user.id);

  const canCreatePage = limits.can_create_page && canUsePages;

  return (
    <DashboardContainer>
      <PageHeader
        title="Your Pages"
        description={
          canUsePages
            ? `${limits.used_pages} / ${limits.max_pages === -1 ? "∞" : limits.max_pages} pages used`
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
        pagination={pagination}
        initialSearch={searchParams.search}
        initialView={(searchParams.view as any) || "list"}
        initialStatus={(searchParams.status as any) || "active"}
        initialDateFilter={searchParams.dateFilter}
      />
    </DashboardContainer>
  );
}
