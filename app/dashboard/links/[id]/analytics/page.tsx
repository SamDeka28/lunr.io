import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { PlanService } from "@/lib/services/plan.service";
import { LinkAnalyticsClient } from "./analytics-client";
import { normalizeLeadCaptureConfig } from "@/lib/utils/lead-capture-config";

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

  let leads: Array<{
    id: string;
    email: string;
    name: string | null;
    responses?: Record<string, string | boolean> | null;
    created_at: string;
  }> = [];

  const leadConfig = link.lead_capture_enabled
    ? normalizeLeadCaptureConfig(link.lead_capture_config)
    : null;

  if (link.lead_capture_enabled) {
    const { data: leadRows } = await supabase
      .from("link_email_captures")
      .select("id, email, name, responses, created_at")
      .eq("link_id", id)
      .order("created_at", { ascending: false })
      .limit(500);
    leads = leadRows || [];
  }

  return (
    <LinkAnalyticsClient
      link={link}
      stats={stats}
      leads={leads}
      leadConfig={leadConfig}
    />
  );
}
