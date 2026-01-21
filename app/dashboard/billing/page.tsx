import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";
import { ProfileService } from "@/lib/services/profile.service";
import { BillingPageClient } from "./billing-page-client";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const planService = new PlanService(supabase);
  const profileService = new ProfileService(supabase);

  // Get current user plan
  const userPlan = await planService.getUserPlan(user.id);
  
  // Get all available plans
  const availablePlans = await profileService.getAvailablePlans();

  // Get subscription history
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select(`
      *,
      plan:plans(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (subscriptionsError) {
    console.error("Error fetching subscriptions:", subscriptionsError);
  }

  return (
    <BillingPageClient
      currentPlan={userPlan}
      availablePlans={availablePlans}
      subscriptions={subscriptions || []}
    />
  );
}

