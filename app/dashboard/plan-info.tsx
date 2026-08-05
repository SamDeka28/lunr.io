"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlanInfoProps {
  planName: string;
  planDisplayName: string;
  features: Record<string, boolean>;
  maxLinks: number;
  maxQRCodes: number;
  usedLinks: number;
  usedQRCodes: number;
}

export function PlanInfo({
  planName,
  planDisplayName,
  features,
  maxLinks,
  maxQRCodes,
  usedLinks,
  usedQRCodes,
}: PlanInfoProps) {
  const isPremium = planName.toLowerCase() !== "free";
  const isUnlimited = maxLinks === -1;

  const featureLabels: Record<string, { label: string; description: string }> = {
    custom_back_half: { label: "Custom back-half", description: "Create custom short codes" },
    expiration: { label: "Link expiration", description: "Set expiration dates for links" },
    utm_parameters: { label: "UTM parameters", description: "Add tracking parameters" },
    custom_domains: { label: "Custom domains", description: "Use your own domain" },
    analytics: { label: "Analytics", description: "Track link performance" },
    qr_codes: { label: "QR codes", description: "Generate QR codes" },
    team_collaboration: { label: "Team collaboration", description: "Work with your team" },
    api_access: { label: "API access", description: "Integrate via API" },
    priority_support: { label: "Priority support", description: "Get help faster" },
  };

  const basicFeatures = [
    { key: "link_generation", label: "Link generation", description: "Shorten URLs and track clicks" },
  ];

  const enabledFeatures = [
    ...basicFeatures,
    ...Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => ({ key, ...featureLabels[key] }))
      .filter((f) => f.label),
  ];

  return (
    <div className="relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft sticky top-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 100% 0%, rgba(67,97,238,0.08), transparent 55%)",
        }}
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-1">
              Current plan
            </div>
            <h3 className="text-lg font-semibold text-neutral-text tracking-tight">
              {planDisplayName}
            </h3>
            <p className="text-sm text-neutral-muted mt-0.5">
              {isPremium ? "Premium features included" : "Free tier"}
            </p>
          </div>
          {!isPremium && (
            <Link href="/dashboard/billing">
              <Button size="sm">Upgrade</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-neutral-bg/80 border border-neutral-border/70">
          <div>
            <div className="text-xs text-neutral-muted mb-0.5">Links</div>
            <div className="text-xl font-semibold text-neutral-text tabular-nums tracking-tight">
              {isUnlimited ? "∞" : `${usedLinks} / ${maxLinks}`}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-muted mb-0.5">QR codes</div>
            <div className="text-xl font-semibold text-neutral-text tabular-nums tracking-tight">
              {maxQRCodes === -1 ? "∞" : `${usedQRCodes} / ${maxQRCodes}`}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-3">
            Included
          </h4>
          {enabledFeatures.length > 0 ? (
            <ul className="space-y-2.5">
              {enabledFeatures.map((feature) => (
                <li key={feature.key} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-text">{feature.label}</div>
                    <div className="text-xs text-neutral-muted leading-relaxed">
                      {feature.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-muted leading-relaxed">
              No premium features enabled.{" "}
              <Link href="/dashboard/billing" className="text-primary font-medium hover:underline">
                View plans
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
