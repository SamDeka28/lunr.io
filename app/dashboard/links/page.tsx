import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { LinksPageWrapper } from "./links-page-wrapper";
import Link from "next/link";
import { Plus, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string; view?: string; status?: string; dateFilter?: string; tag?: string; folder?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const statusFilter = searchParams.status || "active";
  const dateFilter = searchParams.dateFilter;
  const tagFilter = searchParams.tag?.trim();
  const folderFilter = searchParams.folder?.trim();

  let query = supabase
    .from("links")
    .select("*, qr_codes(is_active)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
      `short_code.ilike.%${searchParams.search}%,original_url.ilike.%${searchParams.search}%,title.ilike.%${searchParams.search}%`
    );
  }

  if (tagFilter) {
    query = query.contains("tags", [tagFilter]);
  }

  if (folderFilter) {
    query = query.ilike("folder", folderFilter);
  }

  const { data: links } = await query;

  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  const linkCount = links?.length || 0;
  const canCreateLink = limits.can_create_link;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader
        title="Your Links"
        description={`${linkCount} / ${limits.max_links === -1 ? "∞" : limits.max_links} links used`}
        actions={
          canCreateLink ? (
            <Link href="/dashboard/links/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create link
              </Button>
            </Link>
          ) : undefined
        }
      />

      {linkCount === 0 &&
      !searchParams.search &&
      !tagFilter &&
      !folderFilter &&
      statusFilter === "active" &&
      !dateFilter ? (
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="No links yet"
          description="Create your first short link to start tracking clicks and sharing anywhere."
          action={
            canCreateLink ? (
              <Link href="/dashboard/links/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create link
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <LinksPageWrapper
          links={links || []}
          canCreate={canCreateLink}
          linkCount={linkCount}
          initialSearch={searchParams.search}
          initialView={(searchParams.view as any) || "list"}
          initialStatus={(searchParams.status as any) || "active"}
          initialDateFilter={searchParams.dateFilter}
          initialTag={tagFilter}
          initialFolder={folderFilter}
        />
      )}
    </div>
  );
}
