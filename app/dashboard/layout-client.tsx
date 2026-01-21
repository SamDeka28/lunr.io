"use client";

import { useState } from "react";
import { HelpCircle, Crown, Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { usePathname } from "next/navigation";
import { HeaderSearch } from "./header-search";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { UserMenu } from "./user-menu";
import { PlanBadge } from "@/components/plan-badge";
import { useUserStore } from "@/store/user-store";

export function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email?: string | null };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // Get plan data from Zustand store (fetched on login, no blocking!)
  const plan = useUserStore((state) => state.plan);
  
  const userPlan = plan
    ? {
        planName: plan.planName,
        planDisplayName: plan.planDisplayName,
        isPremium: plan.isPremium,
      }
    : null;

  return (
    <div className="min-h-screen bg-neutral-bg flex">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        pathname={pathname}
        planName={userPlan?.planName}
        planDisplayName={userPlan?.planDisplayName}
      />

      {/* Main Content Area - Add margin to account for fixed sidebar */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-neutral-border">
          <div className="w-full px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-neutral-muted hover:bg-neutral-bg hover:text-electric-sapphire transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md ml-4 lg:ml-0">
              <HeaderSearch />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 ml-4">
              {/* Plan Badge - Show skeleton while loading */}
              {userPlan ? (
                <>
                  <PlanBadge
                    planName={userPlan.planName}
                    planDisplayName={userPlan.planDisplayName}
                    isPremium={userPlan.isPremium}
                    showUpgrade={!userPlan.isPremium}
                  />
                  {!userPlan.isPremium && (
                    <Link
                      href="/dashboard/billing"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-pink to-raspberry-plum text-white text-sm font-semibold hover:from-raspberry-plum hover:to-indigo-bloom transition-all active:scale-[0.98] flex items-center gap-2 shadow-button whitespace-nowrap"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade
                    </Link>
                  )}
                </>
              ) : (
                <div className="h-8 w-24 bg-neutral-border rounded-lg animate-pulse" />
              )}
              <button className="p-2 rounded-xl text-neutral-muted hover:bg-electric-sapphire/10 hover:text-electric-sapphire transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
