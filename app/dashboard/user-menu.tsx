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
      // Clear browser session + cookies first (SSR client writes cookies)
      await supabase.auth.signOut();
      // Also clear any server-side cookie state
      await fetch("/auth/signout", { method: "POST" }).catch(() => {});
      clearStore();
      // Hard navigation so middleware sees a clean unauthenticated request
      window.location.assign("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      clearStore();
      window.location.assign("/login");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-bg hover:bg-neutral-border transition-colors group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-electric-sapphire to-bright-indigo text-white flex items-center justify-center text-xs font-bold shadow-button">
          {user.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="text-sm font-medium text-neutral-text hidden sm:block">
          {user.email?.split("@")[0] || "User"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-soft border border-neutral-border overflow-hidden z-50 animate-slide-reveal">
          <div className="p-2">
            <div className="px-3 py-2 mb-2 border-b border-neutral-border">
              <p className="text-sm font-semibold text-neutral-text">
                {user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-neutral-muted truncate">
                {user.email}
              </p>
            </div>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg transition-colors"
            >
              <User className="h-4 w-4 text-neutral-muted" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg transition-colors"
            >
              <Settings className="h-4 w-4 text-neutral-muted" />
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg transition-colors"
            >
              <CreditCard className="h-4 w-4 text-neutral-muted" />
              Billing
            </Link>
            <div className="my-1 h-px bg-neutral-border" />
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
