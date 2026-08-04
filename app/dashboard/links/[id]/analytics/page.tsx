import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { PlanService } from "@/lib/services/plan.service";
import { LinkAnalyticsClient } from "./analytics-client";

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch link details
  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (linkError || !link) {
    redirect("/dashboard/links");
  }

  const planService = new PlanService(supabase);
  const retentionDays = await planService.getUserAnalyticsRetentionDays(user.id);

  const analyticsService = new AnalyticsService(supabase);
  let stats = null;
  try {
    stats = await analyticsService.getStats(id, { days: retentionDays });
  } catch (error) {
    console.error("Failed to load link analytics stats:", error);
  }

  return <LinkAnalyticsClient link={link} stats={stats} />;
}
