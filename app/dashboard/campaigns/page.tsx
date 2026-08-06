import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignsList } from "./campaigns-list";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  parsePagination,
  paginationMeta,
} from "@/lib/utils/pagination";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string; archived?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const showArchived = searchParams.archived === "1";
  const { page, pageSize, from, to } = parsePagination(searchParams);

  let campaignsQuery = supabase
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  campaignsQuery = showArchived
    ? campaignsQuery.eq("is_active", false)
    : campaignsQuery.eq("is_active", true);

  const campaignsResult = await campaignsQuery;

  const { data: campaigns, count } = campaignsResult;
  const filteredTotal = count ?? 0;
  const pagination = paginationMeta(filteredTotal, page, pageSize);

  if (page > pagination.totalPages && filteredTotal > 0) {
    const params = new URLSearchParams();
    if (pagination.totalPages > 1) params.set("page", String(pagination.totalPages));
    if (showArchived) params.set("archived", "1");
    const qs = params.toString();
    redirect(qs ? `/dashboard/campaigns?${qs}` : "/dashboard/campaigns");
  }

  const campaignIds = (campaigns || []).map((c) => c.id);
  const linkCountsByCampaign = new Map<string, number>();
  const clickCountsByCampaign = new Map<string, number>();

  if (campaignIds.length > 0) {
    const { data: campaignLinks } = await supabase
      .from("links")
      .select("campaign_id, click_count")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .in("campaign_id", campaignIds);

    for (const link of campaignLinks || []) {
      if (link.campaign_id) {
        linkCountsByCampaign.set(
          link.campaign_id,
          (linkCountsByCampaign.get(link.campaign_id) || 0) + 1
        );
        clickCountsByCampaign.set(
          link.campaign_id,
          (clickCountsByCampaign.get(link.campaign_id) || 0) +
            (link.click_count || 0)
        );
      }
    }
  }

  const campaignsWithStats = (campaigns || []).map((campaign) => ({
    ...campaign,
    total_links: linkCountsByCampaign.get(campaign.id) || 0,
    total_clicks: clickCountsByCampaign.get(campaign.id) || 0,
  }));

  return (
    <DashboardContainer>
      <PageHeader
        title="Campaign Studio"
        description="Group links, partners, spend, and analytics by initiative — then compare what wins"
        actions={
          <>
            <Link
              href={showArchived ? "/dashboard/campaigns" : "/dashboard/campaigns?archived=1"}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutral-border bg-white text-sm font-semibold text-neutral-text hover:border-primary/40 hover:text-primary"
            >
              {showArchived ? "Active campaigns" : "Archived"}
            </Link>
            <Link
              href="/docs/campaigns/creating-campaigns"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutral-border bg-white text-sm font-semibold text-neutral-text hover:border-primary/40 hover:text-primary"
            >
              <BookOpen className="h-4 w-4" />
              Studio guide
            </Link>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4" />
                New campaign
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <CampaignsList campaigns={campaignsWithStats || []} showArchived={showArchived} />
        <Pagination pagination={pagination} itemLabel="campaigns" />
      </div>
    </DashboardContainer>
  );
}
