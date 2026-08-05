"use client";

import { useState } from "react";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { CollapsibleSection } from "@/components/collapsible-section";
import type { ProfileWithPlan, Plan, SubscriptionWithPlan } from "@/types/database.types";

interface BillingPageClientProps {
  currentPlan: ProfileWithPlan | null;
  availablePlans: Plan[];
  subscriptions: SubscriptionWithPlan[];
}

function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | undefined;
}) {
  const unlimited = max === -1 || !max;
  const pct = unlimited ? 0 : Math.min((used / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-neutral-muted">{label}</span>
        <span className="text-sm font-semibold text-neutral-text tabular-nums">
          {used} / {unlimited ? "∞" : max}
        </span>
      </div>
      <div className="w-full bg-neutral-surface rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingPageClient({
  currentPlan,
  availablePlans,
  subscriptions,
}: BillingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  const currentPlanData = currentPlan?.plan;
  const currentPlanName = currentPlanData?.name || "free";

  const handleUpgrade = async (planId: string, planName: string) => {
    if (currentPlanName === planName) {
      toast.info("You're already on this plan");
      return;
    }

    setUpgradingPlanId(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade plan");
      setUpgradingPlanId(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to open billing portal");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "pro":
        return Zap;
      case "business":
        return Building2;
      case "enterprise":
        return Crown;
      default:
        return CreditCard;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "success" | "danger" | "default" | "primary"; label: string }> = {
      active: { variant: "success", label: "Active" },
      cancelled: { variant: "danger", label: "Cancelled" },
      expired: { variant: "default", label: "Expired" },
      trial: { variant: "primary", label: "Trial" },
    };
    const conf = map[status];
    if (!conf) return null;
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  return (
    <DashboardContainer>
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage, and invoices."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 relative overflow-hidden" padding="lg">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 80% at 100% 0%, rgba(67,97,238,0.08), transparent 55%)",
            }}
          />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[13px] font-medium text-neutral-muted mb-1">Current plan</p>
                <h2 className="text-2xl font-semibold text-neutral-text tracking-tight">
                  {currentPlanData?.display_name || "Free"}
                </h2>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {(() => {
                  const Icon = getPlanIcon(currentPlanData?.name || "free");
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
            </div>

            {currentPlanData && (
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-neutral-bg/80 border border-neutral-border/70 p-4">
                  <p className="text-xs text-neutral-muted mb-1">Monthly</p>
                  <p className="text-xl font-semibold text-neutral-text tabular-nums">
                    {formatPrice(currentPlanData.price_monthly)}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-bg/80 border border-neutral-border/70 p-4">
                  <p className="text-xs text-neutral-muted mb-1">Yearly</p>
                  <p className="text-xl font-semibold text-neutral-text tabular-nums">
                    {formatPrice(currentPlanData.price_yearly)}
                  </p>
                </div>
                {currentPlan?.plan_started_at && (
                  <div className="rounded-2xl bg-neutral-bg/80 border border-neutral-border/70 p-4">
                    <p className="text-xs text-neutral-muted mb-1">Started</p>
                    <p className="text-sm font-medium text-neutral-text">
                      {formatDate(currentPlan.plan_started_at)}
                    </p>
                  </div>
                )}
                {currentPlan?.plan_expires_at && (
                  <div className="rounded-2xl bg-neutral-bg/80 border border-neutral-border/70 p-4">
                    <p className="text-xs text-neutral-muted mb-1">Expires</p>
                    <p className="text-sm font-medium text-neutral-text">
                      {formatDate(currentPlan.plan_expires_at)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentPlan?.stripe_subscription_id && (
              <div className="mb-5">
                <p className="text-xs text-neutral-muted mb-1.5">Stripe subscription</p>
                <p className="text-xs font-mono text-neutral-text bg-neutral-surface px-3 py-2 rounded-xl break-all border border-neutral-border/70">
                  {currentPlan.stripe_subscription_id}
                </p>
              </div>
            )}

            {currentPlanName !== "free" && (
              <Button variant="outline" onClick={handleManageBilling}>
                Manage billing
              </Button>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-base font-semibold text-neutral-text tracking-tight mb-5">
            Usage
          </h3>
          <div className="space-y-5">
            <UsageBar
              label="Links"
              used={currentPlan?.usage_links || 0}
              max={currentPlanData?.max_links}
            />
            <UsageBar
              label="QR codes"
              used={currentPlan?.usage_qr_codes || 0}
              max={currentPlanData?.max_qr_codes}
            />
            <UsageBar
              label="Pages"
              used={currentPlan?.usage_pages || 0}
              max={currentPlanData?.max_pages}
            />
          </div>
        </Card>
      </div>

      <CollapsibleSection title="Available plans" icon={CreditCard} defaultOpen>
        <div className="mb-5 flex p-1 bg-neutral-surface/90 rounded-full w-fit border border-neutral-border/80 shadow-soft">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              billingCycle === "monthly"
                ? "bg-white text-primary shadow-soft"
                : "text-neutral-muted hover:text-neutral-text"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              billingCycle === "yearly"
                ? "bg-white text-primary shadow-soft"
                : "text-neutral-muted hover:text-neutral-text"
            )}
          >
            Yearly
            <span className="ml-1.5 text-[11px] text-emerald-600 font-semibold">−17%</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {availablePlans.map((plan) => {
            const isCurrentPlan = currentPlanName === plan.name;
            const Icon = getPlanIcon(plan.name);
            const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-card border p-5 transition-all duration-200",
                  isCurrentPlan
                    ? "bg-white border-primary/40 shadow-premium ring-1 ring-primary/15"
                    : "bg-white border-neutral-border/80 shadow-soft hover:shadow-hover hover:-translate-y-0.5"
                )}
              >
                {isCurrentPlan && (
                  <span className="absolute top-3 right-3">
                    <Badge variant="primary">Current</Badge>
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 pr-12">
                    <h3 className="text-base font-semibold text-neutral-text tracking-tight">
                      {plan.display_name}
                    </h3>
                    {plan.description && (
                      <p className="text-xs text-neutral-muted truncate">{plan.description}</p>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-neutral-text tracking-tight tabular-nums">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm text-neutral-muted">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-neutral-muted">
                  <li>
                    <span className="font-medium text-neutral-text">Links:</span>{" "}
                    {plan.max_links === -1 ? "Unlimited" : plan.max_links}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-text">QR codes:</span>{" "}
                    {plan.max_qr_codes === -1 ? "Unlimited" : plan.max_qr_codes}
                  </li>
                  <li>
                    <span className="font-medium text-neutral-text">Pages:</span>{" "}
                    {plan.max_pages === -1 ? "Unlimited" : plan.max_pages}
                  </li>
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "solid"}
                  disabled={isCurrentPlan || upgradingPlanId === plan.id}
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                >
                  {upgradingPlanId === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : isCurrentPlan ? (
                    "Current plan"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Subscription history" icon={Calendar} defaultOpen={false}>
        {subscriptions.length === 0 ? (
          <div className="text-center py-10 text-neutral-muted text-sm">
            No subscription history yet.
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-text">
                        {subscription.plan?.display_name || "Unknown Plan"}
                      </h4>
                      {getStatusBadge(subscription.status)}
                    </div>
                    {subscription.billing_cycle && (
                      <p className="text-xs text-neutral-muted capitalize">
                        {subscription.billing_cycle} billing
                      </p>
                    )}
                  </div>
                  {subscription.plan && (
                    <p className="text-sm font-semibold text-neutral-text tabular-nums">
                      {formatPrice(
                        subscription.billing_cycle === "yearly"
                          ? subscription.plan.price_yearly
                          : subscription.plan.price_monthly
                      )}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-border/70 text-xs">
                  <div>
                    <p className="text-neutral-muted mb-1">Started</p>
                    <p className="font-medium text-neutral-text">
                      {formatDate(subscription.started_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-muted mb-1">
                      {subscription.status === "cancelled" ? "Cancelled" : "Expires"}
                    </p>
                    <p className="font-medium text-neutral-text">
                      {subscription.status === "cancelled" && subscription.cancelled_at
                        ? formatDate(subscription.cancelled_at)
                        : formatDate(subscription.expires_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>
    </DashboardContainer>
  );
}
