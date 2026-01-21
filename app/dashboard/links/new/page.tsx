import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkCreationPage } from "./link-creation-page";
import { PlanService } from "@/lib/services/plan.service";

export default async function NewLinkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user limits using PlanService (server-side validation)
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  if (!limits.can_create_link) {
    redirect("/dashboard/links");
  }

  // Plan features are now handled via Zustand store in the client component
  return <LinkCreationPage userId={user.id} />;
}
