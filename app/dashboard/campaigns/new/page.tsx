import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignForm } from "../campaign-form";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardContainer>
      <PageHeader
        title="Create Campaign"
        description="Organize your links into marketing campaigns"
      />
      <CampaignForm userId={user.id} />
    </DashboardContainer>
  );
}

