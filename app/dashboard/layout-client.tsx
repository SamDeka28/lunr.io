"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { usePathname } from "next/navigation";
import { HeaderSearch } from "./header-search";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { UserMenu } from "./user-menu";
import { PlanBadge } from "@/components/plan-badge";
import { useUserStore } from "@/store/user-store";
import { NavigationLoaderProvider } from "@/components/navigation/navigation-loader";
import { Button } from "@/components/ui/button";

export function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email?: string | null };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!sidebarOpen || isDesktop) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const plan = useUserStore((state) => state.plan);

  const userPlan = plan
    ? {
        planName: plan.planName,
        planDisplayName: plan.planDisplayName,
        isPremium: plan.isPremium,
      }
    : null;

  return (
    <NavigationLoaderProvider>
      <div className="min-h-screen bg-neutral-bg flex overflow-x-hidden">
        <CollapsibleSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          pathname={pathname}
          planName={userPlan?.planName}
          planDisplayName={userPlan?.planDisplayName}
        />

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 w-full transition-all duration-300",
            sidebarOpen ? "lg:ml-72" : "lg:ml-20"
          )}
        >
          <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-neutral-border/70">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2.5 rounded-2xl text-neutral-muted hover:bg-white hover:shadow-soft hover:text-neutral-text transition-all lg:hidden shrink-0"
                  aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                <div className="w-full max-w-md min-w-0">
                  <HeaderSearch />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {userPlan ? (
                  <>
                    <div className="hidden md:block">
                      <PlanBadge
                        planName={userPlan.planName}
                        planDisplayName={userPlan.planDisplayName}
                        isPremium={userPlan.isPremium}
                        showUpgrade={false}
                      />
                    </div>
                    {!userPlan.isPremium && (
                      <Link href="/dashboard/billing" className="hidden sm:inline-flex">
                        <Button size="sm">Upgrade</Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="h-8 w-20 bg-neutral-border/60 rounded-full animate-pulse" />
                )}
                <button
                  className="hidden sm:inline-flex p-2.5 rounded-2xl text-neutral-muted hover:bg-white hover:shadow-soft hover:text-neutral-text transition-all"
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <UserMenu user={user} />
              </div>
            </div>
          </header>

          <main className="relative flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-80"
              style={{
                background:
                  "radial-gradient(60% 80% at 15% 0%, rgba(67,97,238,0.08), transparent 55%), radial-gradient(50% 60% at 90% 10%, rgba(76,201,240,0.07), transparent 50%)",
              }}
            />
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </NavigationLoaderProvider>
  );
}
