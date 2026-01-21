import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Crown } from "lucide-react";
import { PlanInfo } from "../plan-info";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's plan and usage
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const userPlanData = await planService.getUserPlan(user.id);
  const limits = await planService.getUsageLimits(user.id);
  const hasApiAccess = await planService.hasFeature(user.id, "api_access");

  return (
    <div className="max-w-7xl mx-auto w-full">
      <h1 className="text-4xl font-bold text-neutral-text mb-8">Settings</h1>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Settings Content */}
        <div className="lg:col-span-9">
          <SettingsClient userId={user.id} hasApiAccess={hasApiAccess} user={user} />
        </div>

        {/* Sidebar - Plan Info */}
        <div className="lg:col-span-3">
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
            <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-neutral-muted mx-auto mb-4" />
                <p className="text-sm text-neutral-muted">Plan information not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

