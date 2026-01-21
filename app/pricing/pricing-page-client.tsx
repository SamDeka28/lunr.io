"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Building2, Crown, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

  // Sort plans: Free first, then by price
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
    
    // Links
    if (plan.max_links === -1) {
      features.push("Unlimited Links");
    } else {
      features.push(`${plan.max_links} Links`);
    }
    
    // QR Codes
    if (plan.max_qr_codes === -1) {
      features.push("Unlimited QR Codes");
    } else {
      features.push(`${plan.max_qr_codes} QR Codes`);
    }
    
    // Pages
    if (plan.max_pages === -1) {
      features.push("Unlimited Pages");
    } else {
      features.push(`${plan.max_pages} Pages`);
    }
    
    // Additional features from the features object
    if (plan.features) {
      if (plan.features.custom_domains) features.push("Custom Domains");
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

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-electric-sapphire/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-bright-indigo/5 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vivid-royal/3 rounded-full blur-3xl animate-drift"></div>
      </div>
      
      {/* Curved decorative lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
        <path
          d="M0,250 Q500,150 1000,250 T2000,250"
          stroke="url(#pricingGradient1)"
          strokeWidth="3"
          fill="none"
          className="animate-wave"
        />
        <path
          d="M0,450 Q600,350 1200,450 T2400,450"
          stroke="url(#pricingGradient2)"
          strokeWidth="3"
          fill="none"
          className="animate-wave delay-1000"
        />
        <defs>
          <linearGradient id="pricingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="pricingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Floating price tags */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 border-2 border-electric-sapphire/10 rounded-full animate-float"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + (i % 2) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
            <TrendingUp className="h-3 w-3" />
            <span>PRICING</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-neutral-muted mb-8">
            Start free, upgrade when you need more
          </p>
          <div className="inline-flex items-center gap-2 p-1.5 bg-neutral-bg rounded-2xl border-2 border-neutral-border shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative",
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white shadow-lg animate-bounce">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sortedPlans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const highlighted = isHighlighted(plan.name);
            const price = billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;
            const period = billingCycle === "monthly" ? "month" : "year";
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={cn(
                  "p-6 rounded-card border-2 transition-all relative group overflow-hidden",
                  highlighted
                    ? "border-electric-sapphire bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 ring-2 ring-electric-sapphire/20 hover:ring-4 hover:ring-electric-sapphire/30 hover:shadow-2xl hover:-translate-y-1"
                    : "border-neutral-border bg-white hover:border-electric-sapphire/50 hover:shadow-xl hover:-translate-y-1"
                )}
              >
                {/* Gradient overlay on hover */}
                {!highlighted && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-opacity duration-300"></div>
                )}
                
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-xs font-semibold shadow-lg animate-pulse">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-transform duration-300",
                        highlighted ? "group-hover:scale-110 group-hover:rotate-3" : "group-hover:scale-110"
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-neutral-text group-hover:text-electric-sapphire transition-colors">
                      {plan.display_name || plan.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-neutral-text">
                      {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                    </span>
                    {price > 0 && <span className="text-neutral-muted">/{period}</span>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 relative z-10">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200" style={{ transitionDelay: `${idx * 30}ms` }}>
                      <Check className="h-5 w-5 text-electric-sapphire flex-shrink-0" />
                      <span className="text-sm text-neutral-text">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={isAuthenticated ? "/dashboard/billing" : "/login"}
                  className={cn(
                    "w-full block text-center px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] relative z-10 group/button",
                    highlighted
                      ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal shadow-button hover:shadow-xl hover:scale-105"
                      : "bg-neutral-bg text-neutral-text hover:bg-gradient-to-r hover:from-electric-sapphire/10 hover:to-bright-indigo/10 border border-neutral-border hover:border-electric-sapphire/50"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isAuthenticated 
                      ? (plan.name.toLowerCase() === "free" ? "Current Plan" : "Upgrade")
                      : (highlighted ? "Get Started" : "Start Free")
                    }
                    {highlighted && !isAuthenticated && (
                      <ArrowRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
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

