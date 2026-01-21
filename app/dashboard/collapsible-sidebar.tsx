"use client";

import { Home, Link2, QrCode, FileText, BarChart3, Monitor, Globe, Settings, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  planName?: string;
  planDisplayName?: string;
}

export function CollapsibleSidebar({ isOpen, onToggle, pathname, planName, planDisplayName }: CollapsibleSidebarProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const currentPathname = usePathname();

  useEffect(() => {
    // Reset navigation state when pathname changes
    setIsNavigating(false);
  }, [currentPathname]);

  // Track navigation start
  useEffect(() => {
    const handleRouteChangeStart = () => setIsNavigating(true);
    const handleRouteChangeComplete = () => setIsNavigating(false);

    // Listen to Next.js router events
    window.addEventListener('beforeunload', handleRouteChangeStart);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
    };
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-white z-50 flex flex-col transition-all duration-300 border-r border-neutral-border",
          isOpen ? "w-72" : "w-20"
        )}
      >
        {/* Floating Collapse Button - On the border */}
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

        {/* Logo */}
        <div className="px-3 pt-6 pb-5">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button">
                <span className="text-white font-bold text-lg">L</span>
              </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-text">lunr.to</div>
                    <div className="text-xs text-neutral-muted">
                      {planDisplayName || planName || "Loading..."}
                    </div>
                  </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center mx-auto shadow-button">
              <span className="text-white font-bold text-lg">L</span>
            </div>
          )}
        </div>

        {/* Create Button */}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            <NavItem href="/dashboard" icon={Home} pathname={pathname} title="Home" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/links" icon={Link2} pathname={pathname} title="Links" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/qr" icon={QrCode} pathname={pathname} title="QR Codes" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/pages" icon={FileText} pathname={pathname} title="Pages" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/analytics" icon={BarChart3} pathname={pathname} title="Analytics" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/campaigns" icon={Monitor} pathname={pathname} title="Campaigns" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/domains" icon={Globe} pathname={pathname} title="Custom domains" isOpen={isOpen} badge="NEW" onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/billing" icon={CreditCard} pathname={pathname} title="Billing" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
            <NavItem href="/dashboard/settings" icon={Settings} pathname={pathname} title="Settings" isOpen={isOpen} onNavigate={() => setIsNavigating(true)} />
          </div>
        </nav>
        
        {/* Navigation Progress Indicator */}
        {isNavigating && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-border overflow-hidden z-50">
            <div className="h-full bg-gradient-to-r from-electric-sapphire to-bright-indigo animate-[loading_1.5s_ease-in-out_infinite]"></div>
          </div>
        )}
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
        "flex items-center gap-3 rounded-xl transition-all duration-200 relative group",
        isOpen ? "px-3 py-3" : "w-12 h-12 justify-center mx-auto",
        isActive
          ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire shadow-soft border border-electric-sapphire/20"
          : "text-neutral-muted hover:text-electric-sapphire hover:bg-neutral-bg"
      )}
      title={title}
    >
      {/* Active Indicator */}
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
