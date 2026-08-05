"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Building2, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SectionLabel } from "@/components/ui/section-label";

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_links: number;
  max_qr_codes: number;
  max_pages: number;
  features: Record<string, boolean>;
}

interface PricingPageClientProps {
  plans: Plan[];
  isAuthenticated: boolean;
}

export function PricingPageClient({ plans, isAuthenticated }: PricingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const sortedPlans = [...plans].sort((a, b) => {
    if (a.name.toLowerCase() === "free") return -1;
    if (b.name.toLowerCase() === "free") return 1;
    const priceA = billingCycle === "monthly" ? a.price_monthly : a.price_yearly;
    const priceB = billingCycle === "monthly" ? b.price_monthly : b.price_yearly;
    return priceA - priceB;
  });

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "pro":
        return Zap;
      case "business":
        return Building2;
      case "enterprise":
        return Crown;
      default:
        return null;
    }
  };

  const getPlanFeatures = (plan: Plan): string[] => {
    const features: string[] = [];

    if (plan.max_links === -1) {
      features.push("Unlimited Links");
    } else {
      features.push(`${plan.max_links} Links`);
    }

    if (plan.max_qr_codes === -1) {
      features.push("Unlimited QR Codes");
    } else {
      features.push(`${plan.max_qr_codes} QR Codes`);
    }

    if (plan.max_pages === -1) {
      features.push("Unlimited Pages");
    } else {
      features.push(`${plan.max_pages} Pages`);
    }

    if (plan.features) {
      if (plan.features.custom_domains) features.push("Custom Domains for Pages");
      if (plan.features.api_access) features.push("API Access");
      if (plan.features.team_collaboration) features.push("Team Collaboration");
      if (plan.features.priority_support) features.push("Priority Support");
      if (plan.features.advanced_analytics) features.push("Advanced Analytics");
      if (plan.features.expiration) features.push("Link Expiration");
      if (plan.features.password_protection) features.push("Password Protection");
    }

    return features;
  };

  const isHighlighted = (planName: string) => {
    return planName.toLowerCase() === "pro";
  };

  const getCtaLabel = (plan: Plan, highlighted: boolean) => {
    if (isAuthenticated) {
      return plan.name.toLowerCase() === "free" ? "Current plan" : "Upgrade";
    }
    if (plan.price_monthly === 0 && plan.price_yearly === 0) {
      return "Start free";
    }
    return highlighted ? "Get started" : "Get started";
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 10% 0%, rgba(67,97,238,0.08), transparent 45%), radial-gradient(90% 60% at 100% 100%, rgba(67,97,238,0.05), transparent 40%), #F3F5FA",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <SectionLabel>Pricing</SectionLabel>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-text tracking-tight mb-4">
            Simple, transparent{" "}
            <span className="text-primary">pricing</span>
          </h1>
          <p className="text-base sm:text-xl text-neutral-muted mb-8">
            Start free, upgrade when you need more
          </p>
          <div className="inline-flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-xl rounded-full border border-neutral-border/80 shadow-soft">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2",
                billingCycle === "yearly"
                  ? "bg-primary text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
            >
              Yearly
              <span
                className={cn(
                  "text-xs font-medium",
                  billingCycle === "yearly" ? "text-white/80" : "text-primary"
                )}
              >
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sortedPlans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const highlighted = isHighlighted(plan.name);
            const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;
            const period = billingCycle === "monthly" ? "month" : "year";
            const features = getPlanFeatures(plan);
            const ctaLabel = getCtaLabel(plan, highlighted);

            return (
              <div
                key={plan.id}
                className={cn(
                  "p-6 rounded-card border transition-all relative flex flex-col h-full",
                  highlighted
                    ? "border-primary/40 bg-white shadow-hover ring-2 ring-primary/15"
                    : "border-neutral-border/80 bg-white/90 backdrop-blur-xl shadow-soft hover:border-primary/30 hover:shadow-hover"
                )}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                      <div className="p-2 rounded-xl bg-primary">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-2xl font-semibold text-neutral-text">
                          {plan.display_name || plan.name}
                        </h3>
                        {highlighted && (
                          <span className="text-sm font-medium text-neutral-muted">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-semibold text-neutral-text tracking-tight">
                      {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                    </span>
                    {price > 0 && <span className="text-neutral-muted">/{period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-neutral-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={isAuthenticated ? "/dashboard/billing" : "/login"}
                  className={cn(
                    "w-full block text-center px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] mt-auto",
                    highlighted
                      ? "bg-primary text-white hover:bg-bright-indigo shadow-button"
                      : "bg-neutral-bg text-neutral-text hover:bg-primary/10 border border-neutral-border/80 hover:border-primary/40"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    {ctaLabel}
                    {highlighted && !isAuthenticated && (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
