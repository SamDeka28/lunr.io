"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SettingsForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={user.email || ""}
            disabled
            className={cn(
              "w-full pl-12 pr-4 py-3 rounded-lg border-2",
              "bg-gray-50 dark:bg-gray-700",
              "border-gray-200 dark:border-gray-600",
              "text-gray-600 dark:text-gray-400",
              "cursor-not-allowed"
            )}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          Email cannot be changed at this time
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          User ID
        </label>
        <input
          type="text"
          value={user.id}
          disabled
          className={cn(
            "w-full px-4 py-3 rounded-lg border-2",
            "bg-gray-50 dark:bg-gray-700",
            "border-gray-200 dark:border-gray-600",
            "text-gray-600 dark:text-gray-400 font-mono text-sm",
            "cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}

