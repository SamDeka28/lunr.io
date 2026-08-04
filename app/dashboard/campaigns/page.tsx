import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignsList } from "./campaigns-list";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const [campaignsResult, campaignLinksResult] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("links")
      .select("campaign_id, click_count")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .not("campaign_id", "is", null),
  ]);

  const { data: campaigns } = campaignsResult;

  const linkCountsByCampaign = new Map<string, number>();
  const clickCountsByCampaign = new Map<string, number>();
  for (const link of campaignLinksResult.data || []) {
    if (link.campaign_id) {
      linkCountsByCampaign.set(
        link.campaign_id,
        (linkCountsByCampaign.get(link.campaign_id) || 0) + 1
      );
      clickCountsByCampaign.set(
        link.campaign_id,
        (clickCountsByCampaign.get(link.campaign_id) || 0) + (link.click_count || 0)
      );
    }
  }

  const campaignsWithStats = (campaigns || []).map((campaign) => ({
    ...campaign,
    total_links: linkCountsByCampaign.get(campaign.id) || 0,
    total_clicks: clickCountsByCampaign.get(campaign.id) || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader
        title="Campaigns"
        description="Organize, track, and compare your marketing campaigns"
        actions={
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create campaign
            </Button>
          </Link>
        }
      />

      <CampaignsList campaigns={campaignsWithStats || []} />
    </div>
  );
}
