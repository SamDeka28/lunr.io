"use client";

import { Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SettingsForm({ user }: { user: any }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-neutral-muted mb-2">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
          <input
            type="email"
            value={user.email || ""}
            disabled
            className={cn(
              "w-full h-12 pl-11 pr-4 rounded-2xl border border-neutral-border/80",
              "bg-neutral-bg/70 text-neutral-muted text-sm shadow-soft",
              "cursor-not-allowed"
            )}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-muted leading-relaxed">
          Email cannot be changed at this time
        </p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-neutral-muted mb-2">
          User ID
        </label>
        <input
          type="text"
          value={user.id}
          disabled
          className={cn(
            "w-full h-12 px-4 rounded-2xl border border-neutral-border/80",
            "bg-neutral-bg/70 text-neutral-muted text-sm font-mono shadow-soft",
            "cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}
