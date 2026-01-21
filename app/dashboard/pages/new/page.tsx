import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageStudio from "./page-studio";

export default async function NewPagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user limits using PlanService
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  if (!limits.can_create_page) {
    redirect("/dashboard/pages");
  }

  // Check if pages feature is enabled
  const canUsePages = await planService.canUsePages(user.id);
  if (!canUsePages) {
    redirect("/dashboard/pages");
  }

  // Get user's links for selection
  const { data: links } = await supabase
    .from("links")
    .select("id, short_code, original_url, title")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <PageStudio userId={user.id} userLinks={links || []} />;
}

