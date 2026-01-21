"use client";

import { Crown, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

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

  // Link generation is always available (basic feature)
  const basicFeatures = [
    { key: "link_generation", label: "Link generation", description: "Shorten URLs and track clicks" }
  ];

  const enabledFeatures = [
    ...basicFeatures,
    ...Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => ({ key, ...featureLabels[key] }))
      .filter((f) => f.label)
  ];

  return (
    <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isPremium && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-neon-pink" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-neutral-text">{planDisplayName} Plan</h3>
            <p className="text-xs text-neutral-muted">
              {isPremium ? "Premium features enabled" : "Basic features"}
            </p>
          </div>
        </div>
        {!isPremium && (
          <Link
            href="/dashboard/billing"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Link>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-neutral-bg border border-neutral-border">
        <div>
          <div className="text-xs text-neutral-muted mb-1">Links</div>
          <div className="text-2xl font-bold text-neutral-text">
            {isUnlimited ? "∞" : `${usedLinks} / ${maxLinks}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-muted mb-1">QR Codes</div>
          <div className="text-2xl font-bold text-neutral-text">
            {maxQRCodes === -1 ? "∞" : `${usedQRCodes} / ${maxQRCodes}`}
          </div>
        </div>
      </div>

      {/* Features List */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-text mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-electric-sapphire" />
          Available Features
        </h4>
        {enabledFeatures.length > 0 ? (
          <div className="space-y-2">
            {enabledFeatures.map((feature) => (
              <div
                key={feature.key}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10"
              >
                <CheckCircle2 className="h-5 w-5 text-electric-sapphire flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-text">{feature.label}</div>
                  <div className="text-xs text-neutral-muted">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-bg border border-neutral-border text-center">
            <p className="text-sm text-neutral-muted">No premium features enabled</p>
            <Link
              href="/dashboard/billing"
              className="mt-2 inline-block text-sm text-electric-sapphire hover:text-bright-indigo font-semibold"
            >
              View plans →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

