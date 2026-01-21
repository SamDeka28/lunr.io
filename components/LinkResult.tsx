"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";

interface LinkResultProps {
  shortUrl: string;
  originalUrl: string;
  linkId: string;
  initialClickCount?: number;
}

export function LinkResult({ shortUrl, originalUrl, linkId, initialClickCount = 0 }: LinkResultProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [clickCount, setClickCount] = useState(initialClickCount);

  // Real-time subscription for click count updates
  useEffect(() => {
    // Subscribe to changes in the links table
    const channel = supabase
      .channel(`link:${linkId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "links",
          filter: `id=eq.${linkId}`,
        },
        (payload) => {
          const newCount = (payload.new as { click_count: number }).click_count;
          if (newCount !== clickCount) {
            setClickCount(newCount);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkId, clickCount]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4 animate-slide-up">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your shortened link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg border-2",
                  "bg-white dark:bg-gray-800",
                  "border-gray-200 dark:border-gray-700",
                  "text-gray-900 dark:text-white",
                  "font-mono text-sm"
                )}
              />
              <button
                onClick={handleCopy}
                className={cn(
                  "px-4 py-3 rounded-lg font-medium transition-all",
                  "bg-primary text-white",
                  "hover:bg-primary-dark",
                  "active:scale-95",
                  "flex items-center gap-2"
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ExternalLink className="h-4 w-4" />
                <span className="truncate max-w-md">{originalUrl}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {clickCount} {clickCount === 1 ? "click" : "clicks"}
                </span>
                {clickCount > initialClickCount && (
                  <span className="text-xs text-green-500 animate-pulse">● Live</span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`/links/${linkId}`)}
              className={cn(
                "w-full px-4 py-2 rounded-lg font-medium transition-all",
                "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white",
                "hover:bg-gray-200 dark:hover:bg-gray-600",
                "flex items-center justify-center gap-2"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              View Detailed Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
