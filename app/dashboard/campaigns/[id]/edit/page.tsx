import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/ui/dashboard-container";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignForm } from "../../campaign-form";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Get campaign
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !campaign) {
    redirect("/dashboard/campaigns");
  }

  return (
    <DashboardContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-text mb-2">Edit Campaign</h1>
        <p className="text-sm text-neutral-muted">
          Update your campaign details
        </p>
      </div>

      <CampaignForm userId={user.id} campaign={campaign} />
    </DashboardContainer>
  );
}

