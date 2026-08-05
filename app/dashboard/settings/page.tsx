import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { PlanInfo } from "../plan-info";
import { SettingsClient } from "./settings-client";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardContainer } from "@/components/ui/dashboard-container";

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const [userPlanData, limits] = await Promise.all([
    planService.getUserPlan(user.id),
    planService.getUsageLimits(user.id),
  ]);

  let features = userPlanData?.plan?.features || {};
  if (typeof features === "string") {
    try {
      features = JSON.parse(features);
    } catch {
      features = {};
    }
  }
  const hasApiAccess = (features as Record<string, boolean>)["api_access"] === true;

  return (
    <DashboardContainer>
      <PageHeader
        title="Settings"
        description="Account, security, and developer integrations."
      />

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 xl:col-span-9">
          <SettingsClient userId={user.id} hasApiAccess={hasApiAccess} user={user} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          {userPlanData?.plan ? (
            <PlanInfo
              planName={userPlanData.plan.name}
              planDisplayName={userPlanData.plan.display_name}
              features={userPlanData.plan.features || {}}
              maxLinks={limits.max_links === -1 ? -1 : limits.max_links}
              maxQRCodes={limits.max_qr_codes === -1 ? -1 : limits.max_qr_codes}
              usedLinks={limits.used_links}
              usedQRCodes={limits.used_qr_codes}
            />
          ) : (
            <div className="bg-white rounded-card p-5 border border-neutral-border/80 shadow-soft">
              <p className="text-sm text-neutral-muted">Plan information not available</p>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
}
