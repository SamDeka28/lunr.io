"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";

export function UserMenu({ user }: { user: { email?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const clearStore = useUserStore((state) => state.clearStore);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      await fetch("/auth/signout", { method: "POST" }).catch(() => {});
      clearStore();
      window.location.assign("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      clearStore();
      window.location.assign("/login");
    }
  };

  const initial = user.email?.charAt(0).toUpperCase() || "U";
  const displayName = user.email?.split("@")[0] || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pl-1.5 sm:pr-3 py-1.5 rounded-full",
          "bg-white/80 border border-neutral-border/80 shadow-soft",
          "hover:shadow-hover hover:border-primary/20 transition-all duration-200",
          isOpen && "ring-2 ring-primary/20 border-primary/30"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shadow-button">
          {initial}
        </div>
        <span className="text-sm font-medium text-neutral-text hidden sm:block max-w-[8rem] truncate tracking-tight">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-neutral-muted transition-transform duration-200 hidden sm:block",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2.5 w-64 z-50 animate-slide-reveal overflow-hidden rounded-special border border-neutral-border/80 bg-white/95 backdrop-blur-xl shadow-float"
        >
          <div className="relative px-4 py-3.5 border-b border-neutral-border/70">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 120% at 0% 0%, rgba(67,97,238,0.07), transparent 55%)",
              }}
            />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-semibold shadow-button shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-text tracking-tight truncate">
                  {displayName}
                </p>
                <p className="text-xs text-neutral-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2 space-y-0.5">
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-neutral-text hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-xl bg-neutral-surface text-neutral-muted flex items-center justify-center">
                <User className="h-4 w-4" />
              </span>
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-neutral-text hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-xl bg-neutral-surface text-neutral-muted flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </span>
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-neutral-text hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-xl bg-neutral-surface text-neutral-muted flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </span>
              Billing
            </Link>
          </div>

          <div className="p-2 pt-0 border-t border-neutral-border/70 mt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <span className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </span>
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
