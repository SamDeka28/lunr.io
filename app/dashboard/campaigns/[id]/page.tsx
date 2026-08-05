import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignWorkspace } from "./campaign-workspace";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { tab } = await searchParams;

  const { CampaignService } = await import("@/lib/services/campaign.service");
  const campaignService = new CampaignService(supabase);
  const campaign = await campaignService.getCampaignWithStats(id, user.id);
  if (!campaign) redirect("/dashboard/campaigns");

  return (
    <CampaignWorkspace
      campaign={campaign}
      initialTab={tab || "overview"}
      userId={user.id}
    />
  );
}
