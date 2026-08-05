"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface PlanBadgeProps {
  planName: string;
  planDisplayName?: string;
  isPremium?: boolean;
  className?: string;
  showUpgrade?: boolean;
}

export function PlanBadge({
  planName,
  planDisplayName,
  isPremium = false,
  className,
  showUpgrade = false,
}: PlanBadgeProps) {
  const displayName = planDisplayName || planName.charAt(0).toUpperCase() + planName.slice(1);
  const isFree = planName.toLowerCase() === "free";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight border shadow-soft",
          isPremium && !isFree
            ? "bg-primary/10 text-primary border-primary/15"
            : "bg-white text-neutral-muted border-neutral-border/80"
        )}
      >
        {displayName}
      </span>
      {showUpgrade && isFree && (
        <Link
          href="/dashboard/billing"
          className="text-xs text-primary hover:text-bright-indigo font-medium"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}

interface FeatureListProps {
  features: Record<string, boolean>;
  planName: string;
}

export function FeatureList({ features }: FeatureListProps) {
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

  const enabledFeatures = Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => featureLabels[key] || key)
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-neutral-muted uppercase tracking-wide mb-3">
        Available features
      </h4>
      {enabledFeatures.length > 0 ? (
        <div className="space-y-1.5">
          {enabledFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-sm text-neutral-text">{feature}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-muted">No premium features enabled</p>
      )}
    </div>
  );
}
