import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignsList } from "./campaigns-list";
import Link from "next/link";
import { Monitor, Plus } from "lucide-react";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's campaigns
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Get link counts for each campaign
  const campaignsWithStats = await Promise.all(
    (campaigns || []).map(async (campaign) => {
      const { count } = await supabase
        .from("links")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .eq("is_active", true);

      return {
        ...campaign,
        total_links: count || 0,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Campaigns</h1>
            <p className="text-sm text-neutral-muted">
              Organize and track your marketing campaigns
            </p>
          </div>
          <Link
            href="/dashboard/campaigns/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Campaigns List */}
      <CampaignsList campaigns={campaignsWithStats || []} />
    </div>
  );
}

