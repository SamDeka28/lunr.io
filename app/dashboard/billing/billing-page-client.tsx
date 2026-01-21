"use client";

import { useState } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { CollapsibleSection } from "@/components/collapsible-section";
import type { ProfileWithPlan, Plan, SubscriptionWithPlan } from "@/types/database.types";

interface BillingPageClientProps {
  currentPlan: ProfileWithPlan | null;
  availablePlans: Plan[];
  subscriptions: SubscriptionWithPlan[];
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
  
  // Filter out free plan from available plans for upgrade options
  const upgradePlans = availablePlans.filter(plan => plan.name !== "free");

  const handleUpgrade = async (planId: string, planName: string) => {
    if (currentPlanName === planName) {
      toast.info("You're already on this plan");
      return;
    }

    setUpgradingPlanId(planId);
    try {
      // TODO: Integrate with Stripe checkout or payment processing
      toast.info(`Upgrading to ${planName} plan...`);
      // For now, just show a message
      // In production, this would redirect to Stripe checkout
      setTimeout(() => {
        setUpgradingPlanId(null);
        toast.success("Redirecting to checkout...");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade plan");
      setUpgradingPlanId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

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
      case "free":
        return null;
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

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "from-neutral-400 to-neutral-500";
      case "pro":
        return "from-electric-sapphire to-bright-indigo";
      case "business":
        return "from-bright-indigo to-vivid-royal";
      case "enterprise":
        return "from-vivid-royal to-neon-pink";
      default:
        return "from-neutral-400 to-neutral-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
            Active
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      case "expired":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800">
            Expired
          </span>
        );
      case "trial":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
            Trial
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-text mb-2">Billing & Subscription</h1>
        <p className="text-sm text-neutral-muted">Manage your subscription and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-text mb-1">Current Plan</h2>
                <p className="text-sm text-neutral-muted">
                  {currentPlanData?.display_name || "Free"} Plan
                </p>
              </div>
              {currentPlanData && (
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  getPlanColor(currentPlanData.name)
                )}>
                  {(() => {
                    const Icon = getPlanIcon(currentPlanData.name);
                    return Icon ? <Icon className="h-6 w-6 text-white" /> : null;
                  })()}
                </div>
              )}
            </div>

            {currentPlanData && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-neutral-border">
                  <span className="text-sm text-neutral-muted">Monthly Price</span>
                  <span className="text-lg font-bold text-neutral-text">
                    {formatPrice(currentPlanData.price_monthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-border">
                  <span className="text-sm text-neutral-muted">Yearly Price</span>
                  <span className="text-lg font-bold text-neutral-text">
                    {formatPrice(currentPlanData.price_yearly)}
                  </span>
                </div>
                {currentPlan?.plan_started_at && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-border">
                    <span className="text-sm text-neutral-muted">Started</span>
                    <span className="text-sm font-medium text-neutral-text">
                      {formatDate(currentPlan.plan_started_at)}
                    </span>
                  </div>
                )}
                {currentPlan?.plan_expires_at && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-muted">Expires</span>
                    <span className="text-sm font-medium text-neutral-text">
                      {formatDate(currentPlan.plan_expires_at)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {currentPlan?.stripe_subscription_id && (
              <div className="pt-4 border-t border-neutral-border">
                <p className="text-xs text-neutral-muted mb-2">Stripe Subscription ID</p>
                <p className="text-sm font-mono text-neutral-text bg-neutral-bg px-3 py-2 rounded-lg">
                  {currentPlan.stripe_subscription_id}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Summary */}
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft">
          <h3 className="text-lg font-bold text-neutral-text mb-4">Usage Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-muted">Links</span>
                <span className="text-sm font-semibold text-neutral-text">
                  {currentPlan?.usage_links || 0} / {currentPlanData?.max_links === -1 ? "∞" : currentPlanData?.max_links || 0}
                </span>
              </div>
              <div className="w-full bg-neutral-bg rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-electric-sapphire to-bright-indigo h-2 rounded-full transition-all"
                  style={{
                    width: `${currentPlanData?.max_links === -1 || !currentPlanData?.max_links 
                      ? 0 
                      : Math.min((currentPlan?.usage_links || 0) / currentPlanData.max_links * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-muted">QR Codes</span>
                <span className="text-sm font-semibold text-neutral-text">
                  {currentPlan?.usage_qr_codes || 0} / {currentPlanData?.max_qr_codes === -1 ? "∞" : currentPlanData?.max_qr_codes || 0}
                </span>
              </div>
              <div className="w-full bg-neutral-bg rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-electric-sapphire to-bright-indigo h-2 rounded-full transition-all"
                  style={{
                    width: `${currentPlanData?.max_qr_codes === -1 || !currentPlanData?.max_qr_codes 
                      ? 0 
                      : Math.min((currentPlan?.usage_qr_codes || 0) / currentPlanData.max_qr_codes * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-muted">Pages</span>
                <span className="text-sm font-semibold text-neutral-text">
                  {currentPlan?.usage_pages || 0} / {currentPlanData?.max_pages === -1 ? "∞" : currentPlanData?.max_pages || 0}
                </span>
              </div>
              <div className="w-full bg-neutral-bg rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-electric-sapphire to-bright-indigo h-2 rounded-full transition-all"
                  style={{
                    width: `${currentPlanData?.max_pages === -1 || !currentPlanData?.max_pages 
                      ? 0 
                      : Math.min((currentPlan?.usage_pages || 0) / currentPlanData.max_pages * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <CollapsibleSection
        title="Available Plans"
        icon={CreditCard}
        defaultOpen={true}
      >
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                : "bg-neutral-bg text-neutral-text hover:bg-neutral-border"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                : "bg-neutral-bg text-neutral-text hover:bg-neutral-border"
            )}
          >
            Yearly
            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
              Save 17%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePlans.map((plan) => {
            const isCurrentPlan = currentPlanName === plan.name;
            const Icon = getPlanIcon(plan.name);
            const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;
            const features = typeof plan.features === "string" 
              ? JSON.parse(plan.features) 
              : plan.features || {};

            return (
              <div
                key={plan.id}
                className={cn(
                  "bg-white rounded-card border-2 p-6 shadow-soft transition-all",
                  isCurrentPlan
                    ? "border-electric-sapphire ring-2 ring-electric-sapphire/20"
                    : "border-neutral-border hover:border-electric-sapphire/50"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  {Icon && (
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      getPlanColor(plan.name)
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-text">{plan.display_name}</h3>
                    <p className="text-xs text-neutral-muted">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-neutral-text">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm text-neutral-muted">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-text">
                    <span className="font-medium">Links:</span>
                    <span>{plan.max_links === -1 ? "Unlimited" : plan.max_links}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-text">
                    <span className="font-medium">QR Codes:</span>
                    <span>{plan.max_qr_codes === -1 ? "Unlimited" : plan.max_qr_codes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-text">
                    <span className="font-medium">Pages:</span>
                    <span>{plan.max_pages === -1 ? "Unlimited" : plan.max_pages}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                  disabled={isCurrentPlan || upgradingPlanId === plan.id}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    isCurrentPlan
                      ? "bg-neutral-bg text-neutral-muted cursor-not-allowed"
                      : "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal shadow-button active:scale-[0.98]",
                    upgradingPlanId === plan.id && "opacity-70 cursor-wait"
                  )}
                >
                  {upgradingPlanId === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    "Upgrade"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Subscription History */}
      <CollapsibleSection
        title="Subscription History"
        icon={Calendar}
        defaultOpen={false}
      >
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-neutral-muted">
            <p>No subscription history found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white rounded-card border border-neutral-border p-4 shadow-soft"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-neutral-text">
                        {subscription.plan?.display_name || "Unknown Plan"}
                      </h4>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <p className="text-xs text-neutral-muted">
                      {subscription.billing_cycle && (
                        <span className="capitalize">{subscription.billing_cycle} billing</span>
                      )}
                    </p>
                  </div>
                  {subscription.plan && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-text">
                        {formatPrice(
                          subscription.billing_cycle === "yearly"
                            ? subscription.plan.price_yearly
                            : subscription.plan.price_monthly
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-border text-xs">
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
    </div>
  );
}

