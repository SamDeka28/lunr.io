"use client";

import { Home, Link2, QrCode, FileText, BarChart3, Monitor, Globe, Settings, CreditCard, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/brand-logo";
import { isCampaignsEnabled } from "@/lib/features";

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  planName?: string;
  planDisplayName?: string;
}

const NAV_ITEMS: Array<{
  href: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  feature?: "campaigns";
}> = [
  { href: "/dashboard", title: "Home", icon: Home },
  { href: "/dashboard/links", title: "Links", icon: Link2 },
  { href: "/dashboard/qr", title: "QR Codes", icon: QrCode },
  { href: "/dashboard/pages", title: "Pages", icon: FileText },
  { href: "/dashboard/analytics", title: "Analytics", icon: BarChart3 },
  { href: "/dashboard/campaigns", title: "Campaigns", icon: Monitor, feature: "campaigns" },
  { href: "/dashboard/domains", title: "Custom domains", icon: Globe, badge: "NEW" },
  { href: "/dashboard/billing", title: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", title: "Settings", icon: Settings },
];

export function CollapsibleSidebar({ isOpen, onToggle, pathname, planName, planDisplayName }: CollapsibleSidebarProps) {
  const currentPathname = usePathname();
  const activePath = currentPathname || pathname;
  const navItems = NAV_ITEMS.filter(
    (item) => item.feature !== "campaigns" || isCampaignsEnabled()
  );

  const closeOnMobileNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && isOpen) {
      onToggle();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-text/20 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300",
          "bg-white/90 backdrop-blur-xl border-r border-neutral-border/70",
          "w-72 max-lg:shadow-float",
          isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          "lg:translate-x-0",
          isOpen ? "lg:w-72" : "lg:w-20"
        )}
      >
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-28 z-50 w-6 h-6 rounded-full bg-white border border-neutral-border shadow-soft",
            "flex items-center justify-center text-neutral-muted hover:text-primary hover:border-primary/30",
            "transition-all duration-200 hidden lg:flex"
          )}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="px-4 pt-6 pb-4">
          {isOpen ? (
            <div className="px-1 space-y-1">
              <BrandLogo href="/dashboard" variant="full" size="sm" />
              <div className="text-xs text-neutral-muted pl-0.5 font-medium">
                {planDisplayName || planName || "Loading…"}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center">
              <BrandLogo href="/dashboard" variant="mark" size="md" />
            </div>
          )}
        </div>

        <div className="px-4 pb-5">
          <Link
            href="/dashboard/links/new"
            prefetch={true}
            onClick={closeOnMobileNavigate}
            className={cn(
              "rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow-button",
              "hover:bg-bright-indigo hover:shadow-hover transition-all duration-200 active:scale-[0.98]",
              isOpen
                ? "w-full h-11 px-4 gap-2 text-sm"
                : "w-11 h-11 mx-auto"
            )}
            title="Create new"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {isOpen && <span>Create new</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                pathname={activePath}
                title={item.title}
                isOpen={isOpen}
                badge={item.badge}
                onNavigate={closeOnMobileNavigate}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  pathname,
  title,
  isOpen,
  badge,
  onNavigate,
}: {
  href: string;
  icon: React.ElementType;
  pathname: string;
  title: string;
  isOpen: boolean;
  badge?: string;
  onNavigate?: () => void;
}) {
  const isActive = href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      prefetch={true}
      scroll={false}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-2xl transition-all duration-200 relative group",
        isOpen ? "px-3.5 py-2.5" : "w-11 h-11 justify-center mx-auto",
        isActive
          ? "bg-primary/10 text-primary shadow-soft"
          : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface/80"
      )}
      title={title}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] flex-shrink-0 transition-colors",
          isActive ? "text-primary" : "text-neutral-muted group-hover:text-neutral-text"
        )}
      />

      {isOpen && (
        <>
          <span
            className={cn(
              "text-sm flex-1 tracking-tight",
              isActive ? "font-semibold text-primary" : "font-medium"
            )}
          >
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                isActive
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
