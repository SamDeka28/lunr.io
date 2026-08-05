"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type MobileBottomNavProps = {
  children: React.ReactNode;
  className?: string;
};

/** Fixed horizontal-scroll bottom bar for section navigation on small screens. */
export function MobileBottomNav({ children, className }: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-border",
        "bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      aria-label="Section navigation"
    >
      <div className="flex items-stretch gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </nav>
  );
}

type MobileBottomNavItemProps = {
  active?: boolean;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  label: string;
};

export function MobileBottomNavItem({
  active,
  onClick,
  href,
  icon,
  label,
}: MobileBottomNavItemProps) {
  const className = cn(
    "flex flex-col items-center justify-center gap-0.5 min-w-[4.5rem] px-2.5 py-1.5 rounded-xl",
    "text-[10px] font-semibold leading-tight whitespace-nowrap transition-colors shrink-0",
    active
      ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire"
      : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
  );

  const content = (
    <>
      {icon ? <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      <span className="max-w-[4.75rem] truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
