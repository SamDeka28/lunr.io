"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/links?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/dashboard/links");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/dashboard/links");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={cn(
        "absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors",
        isFocused ? "text-electric-sapphire" : "text-neutral-muted"
      )}>
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search links..."
        className={cn(
          "w-full pl-11 pr-11 h-11 rounded-xl bg-neutral-bg border-2 border-transparent",
          "text-neutral-text font-medium",
          "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
          "placeholder:text-neutral-muted",
          "text-sm transition-all"
        )}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <X className="h-4 w-4 text-neutral-muted" />
        </button>
      )}
    </form>
  );
}
