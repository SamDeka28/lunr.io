import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { LinkCreationPage } from "./link-creation-page";
import { PlanService } from "@/lib/services/plan.service";

export default async function NewLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign_id?: string }> | { campaign_id?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  if (!limits.can_create_link) {
    redirect("/dashboard/links");
  }

  const params = await Promise.resolve(searchParams);

  return (
    <LinkCreationPage
      userId={user.id}
      initialCampaignId={params.campaign_id || ""}
    />
  );
}
