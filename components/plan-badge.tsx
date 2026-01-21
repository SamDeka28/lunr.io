"use client";

import { Crown, CheckCircle2 } from "lucide-react";
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
      {isPremium && !isFree && (
        <Crown className="h-4 w-4 text-neon-pink" />
      )}
      <span className={cn(
        "text-sm font-semibold",
        isPremium && !isFree ? "text-neon-pink" : "text-neutral-text"
      )}>
        {displayName}
      </span>
      {showUpgrade && isFree && (
        <Link
          href="/pricing"
          className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold"
        >
          Upgrade →
        </Link>
      )}
    </div>
  );
}

interface FeatureListProps {
  features: Record<string, boolean>;
  planName: string;
}

export function FeatureList({ features, planName }: FeatureListProps) {
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
      <h4 className="text-xs font-semibold text-neutral-text uppercase tracking-wide mb-3">
        Available Features
      </h4>
      {enabledFeatures.length > 0 ? (
        <div className="space-y-1.5">
          {enabledFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-electric-sapphire flex-shrink-0" />
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

