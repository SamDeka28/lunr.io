"use client";

import { Home, Link2, QrCode, FileText, BarChart3, Monitor, Globe, Settings, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/brand-logo";

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
}> = [
  { href: "/dashboard", title: "Home", icon: Home },
  { href: "/dashboard/links", title: "Links", icon: Link2 },
  { href: "/dashboard/qr", title: "QR Codes", icon: QrCode },
  { href: "/dashboard/pages", title: "Pages", icon: FileText },
  { href: "/dashboard/analytics", title: "Analytics", icon: BarChart3 },
  { href: "/dashboard/campaigns", title: "Campaigns", icon: Monitor },
  { href: "/dashboard/domains", title: "Custom domains", icon: Globe, badge: "NEW" },
  { href: "/dashboard/billing", title: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", title: "Settings", icon: Settings },
];

export function CollapsibleSidebar({ isOpen, onToggle, pathname, planName, planDisplayName }: CollapsibleSidebarProps) {
  const currentPathname = usePathname();
  const activePath = currentPathname || pathname;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-white z-50 flex flex-col transition-all duration-300 border-r border-neutral-border",
          isOpen ? "w-72" : "w-20"
        )}
      >
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-6 top-32 z-50 w-6 h-12 rounded-l-none rounded-r-xl bg-white border-r-2 border-neutral-border shadow-soft",
            "flex items-center justify-center text-neutral-muted hover:text-electric-sapphire hover:border-electric-sapphire",
            "transition-all duration-200 hover:shadow-hover",
            "hidden lg:flex"
          )}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="px-3 pt-6 pb-5">
          {isOpen ? (
            <div className="px-1 space-y-1">
              <BrandLogo href="/dashboard" variant="full" size="sm" />
              <div className="text-xs text-neutral-muted pl-0.5">
                {planDisplayName || planName || "Loading..."}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <BrandLogo href="/dashboard" variant="mark" size="md" />
            </div>
          )}
        </div>

        <div className="px-3 pb-5">
          <Link
            href="/dashboard/links/new"
            prefetch={true}
            className={cn(
              "rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white flex items-center justify-center font-semibold shadow-button",
              "hover:from-bright-indigo hover:to-vivid-royal transition-all duration-200 active:scale-[0.98]",
              isOpen ? "w-full h-12 px-4 gap-2 text-sm" : "w-12 h-12 mx-auto"
            )}
            title="Create new"
          >
            <span className="text-xl font-bold">+</span>
            {isOpen && <span>Create new</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                pathname={activePath}
                title={item.title}
                isOpen={isOpen}
                badge={item.badge}
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
}: {
  href: string;
  icon: React.ElementType;
  pathname: string;
  title: string;
  isOpen: boolean;
  badge?: string;
}) {
  const isActive = href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      prefetch={true}
      scroll={false}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-all duration-200 relative group",
        isOpen ? "px-3 py-3" : "w-12 h-12 justify-center mx-auto",
        isActive
          ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire shadow-soft border border-electric-sapphire/20"
          : "text-neutral-muted hover:text-electric-sapphire hover:bg-neutral-bg"
      )}
      title={title}
    >
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-electric-sapphire to-bright-indigo rounded-r-full" />
      )}

      <Icon className={cn(
        "h-5 w-5 flex-shrink-0 transition-colors",
        isActive ? "text-electric-sapphire" : "text-neutral-muted group-hover:text-electric-sapphire"
      )} />

      {isOpen && (
        <>
          <span className={cn(
            "text-sm flex-1 font-medium",
            isActive ? "text-electric-sapphire" : "text-neutral-text"
          )}>
            {title}
          </span>
          {badge && (
            <span className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold",
              isActive
                ? "bg-gradient-to-r from-neon-pink to-raspberry-plum text-white shadow-button"
                : "bg-gradient-to-r from-neon-pink/10 to-raspberry-plum/10 text-neon-pink"
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
