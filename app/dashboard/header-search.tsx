"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Link2, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

type SearchResult = {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  click_count: number | null;
};

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const runSearch = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/links?q=${encodeURIComponent(trimmed)}&limit=8`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(Array.isArray(data.links) ? data.links : []);
      setActiveIndex(-1);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, isOpen, runSearch]);

  const goToLinksList = (query: string) => {
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/dashboard/links?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/dashboard/links");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      router.push(`/dashboard/links/${results[activeIndex].id}/edit`);
      setIsOpen(false);
      return;
    }
    goToLinksList(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
    if (searchParams.get("search")) {
      router.push("/dashboard/links");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = isOpen && searchQuery.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors",
            isOpen ? "text-primary" : "text-neutral-muted"
          )}
        >
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search links..."
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="header-search-results"
          aria-autocomplete="list"
          className={cn(
            "w-full pl-10 pr-10 h-10 sm:h-11 rounded-full",
            "bg-white/80 border border-neutral-border/80 shadow-soft",
            "text-neutral-text text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white",
            "placeholder:text-neutral-muted transition-all duration-200"
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-neutral-surface transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-neutral-muted" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-neutral-border/80 bg-white shadow-float"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3.5 text-sm text-neutral-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3.5 text-sm text-neutral-muted">
              No links match “{searchQuery.trim()}”
            </div>
          ) : (
            <ul className="py-1.5 max-h-80 overflow-y-auto">
              {results.map((link, index) => {
                const title =
                  link.title ||
                  (() => {
                    try {
                      return new URL(link.original_url).hostname;
                    } catch {
                      return link.short_code;
                    }
                  })();
                return (
                  <li key={link.id} role="option" aria-selected={index === activeIndex}>
                    <Link
                      href={`/dashboard/links/${link.id}/edit`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 mx-1.5 rounded-xl transition-colors",
                        index === activeIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-neutral-bg text-neutral-text"
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                          index === activeIndex
                            ? "bg-primary/15 text-primary"
                            : "bg-neutral-surface text-neutral-muted"
                        )}
                      >
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate tracking-tight">
                          {title}
                        </div>
                        <div className="text-xs text-neutral-muted truncate font-mono">
                          /{link.short_code}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 opacity-40 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => goToLinksList(searchQuery)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-primary border-t border-neutral-border/70 hover:bg-primary/5 transition-colors"
          >
            View all results
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
