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
  searchParams: { page?: string; pageSize?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { page, pageSize, from, to } = parsePagination(searchParams);

  const campaignsResult = await supabase
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: campaigns, count } = campaignsResult;
  const filteredTotal = count ?? 0;
  const pagination = paginationMeta(filteredTotal, page, pageSize);

  if (page > pagination.totalPages && filteredTotal > 0) {
    const params = new URLSearchParams();
    if (pagination.totalPages > 1) params.set("page", String(pagination.totalPages));
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
        title="Campaigns"
        description="Organize, track, and compare your marketing campaigns"
        actions={
          <>
            <Link
              href="/docs/campaigns/influencer-setup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutral-border bg-white text-sm font-semibold text-neutral-text hover:border-primary/40 hover:text-primary"
            >
              <BookOpen className="h-4 w-4" />
              Setup guide
            </Link>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create campaign
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <CampaignsList campaigns={campaignsWithStats || []} />
        <Pagination pagination={pagination} itemLabel="campaigns" />
      </div>
    </DashboardContainer>
  );
}
