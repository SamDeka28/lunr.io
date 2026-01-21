"use client";

import { CheckCircle2, XCircle, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface PlanFeaturesProps {
  currentPlan: string;
  currentPlanDisplay: string;
  features: Record<string, boolean>;
  allPlans: Array<{
    name: string;
    display_name: string;
    features: Record<string, boolean>;
  }>;
}

export function PlanFeatures({
  currentPlan,
  currentPlanDisplay,
  features,
  allPlans,
}: PlanFeaturesProps) {
  const allFeatureKeys = new Set<string>();
  allPlans.forEach((plan) => {
    Object.keys(plan.features || {}).forEach((key) => allFeatureKeys.add(key));
  });

  const featureLabels: Record<string, string> = {
    custom_back_half: "Custom back-half",
    expiration: "Link expiration",
    utm_parameters: "UTM parameters",
    custom_domains: "Custom domains",
    analytics: "Analytics",
    qr_codes: "QR codes",
    team_collaboration: "Team collaboration",
    api_access: "API access",
    priority_support: "Priority support",
  };

  const featureDescriptions: Record<string, string> = {
    custom_back_half: "Create memorable custom short codes",
    expiration: "Set expiration dates for your links",
    utm_parameters: "Add UTM tracking parameters",
    custom_domains: "Use your own domain for short links",
    analytics: "Track clicks and performance",
    qr_codes: "Generate QR codes for your links",
    team_collaboration: "Collaborate with your team",
    api_access: "Integrate via REST API",
    priority_support: "Get priority customer support",
  };

  return (
    <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-electric-sapphire" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-text">Feature Comparison</h3>
          <p className="text-xs text-neutral-muted">See what's included in each plan</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
        <p className="text-sm font-semibold text-neutral-text">
          Current Plan: <span className="text-electric-sapphire">{currentPlanDisplay}</span>
        </p>
      </div>

      <div className="space-y-3">
        {Array.from(allFeatureKeys).map((featureKey) => {
          const featureLabel = featureLabels[featureKey] || featureKey;
          const featureDescription = featureDescriptions[featureKey] || "";
          const hasFeature = features[featureKey] === true;

          // Find which plans have this feature
          const plansWithFeature = allPlans.filter(
            (plan) => plan.features?.[featureKey] === true
          );

          return (
            <div
              key={featureKey}
              className={cn(
                "p-4 rounded-xl border transition-all",
                hasFeature
                  ? "bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border-electric-sapphire/20"
                  : "bg-neutral-bg border-neutral-border"
              )}
            >
              <div className="flex items-start gap-3">
                {hasFeature ? (
                  <CheckCircle2 className="h-5 w-5 text-electric-sapphire flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-neutral-muted flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-sm font-semibold",
                      hasFeature ? "text-neutral-text" : "text-neutral-muted"
                    )}>
                      {featureLabel}
                    </span>
                    {!hasFeature && plansWithFeature.length > 0 && (
                      <span className="text-xs text-neutral-muted">
                        (Available in {plansWithFeature.map(p => p.display_name).join(", ")})
                      </span>
                    )}
                  </div>
                  {featureDescription && (
                    <p className="text-xs text-neutral-muted">{featureDescription}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(features).filter(k => features[k] === true).length === 0 && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10 text-center">
          <Crown className="h-8 w-8 text-neon-pink mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-text mb-1">
            Upgrade to unlock premium features
          </p>
          <p className="text-xs text-neutral-muted mb-3">
            Get access to custom back-halves, expiration dates, and more
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-pink to-raspberry-plum text-white text-sm font-semibold hover:from-raspberry-plum hover:to-indigo-bloom transition-all active:scale-[0.98] shadow-button"
          >
            <Crown className="h-4 w-4" />
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
}

