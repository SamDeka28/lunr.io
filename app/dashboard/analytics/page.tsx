import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { PlanService } from "@/lib/services/plan.service";
import { AnalyticsOverviewClient } from "./analytics-overview-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  // Touch supabase so the auth cookie is validated in this RSC
  await supabase.auth.getUser();

  const planService = new PlanService(supabase);
  const retentionDays = await planService.getUserAnalyticsRetentionDays(user.id);

  return <AnalyticsOverviewClient retentionDays={retentionDays} />;
}
