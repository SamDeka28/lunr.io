"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type ListPagination,
} from "@/lib/utils/pagination";

export interface PaginationProps {
  pagination: ListPagination;
  className?: string;
  /** Optional label for the item type, e.g. "links" */
  itemLabel?: string;
}

function buildHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number
) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    if (i > 0 && page - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
}

export function Pagination({
  pagination,
  className,
  itemLabel = "items",
}: PaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (pagination.total === 0) {
    return null;
  }

  const { page, pageSize, totalPages, hasPrev, hasNext, from, to, total } =
    pagination;
  const pages = pageWindow(page, totalPages);
  const showPageNav = total > pageSize || page > 1;

  const handlePageSizeChange = (nextSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (nextSize === DEFAULT_PAGE_SIZE) params.delete("pageSize");
    else params.set("pageSize", String(nextSize));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <>
      {/* Reserve space so list content isn't covered by the floating bar */}
      <div className="h-20 sm:h-24" aria-hidden />

      <div
        className={cn(
          "fixed bottom-4 z-40 flex justify-center pointer-events-none px-3 sm:px-6",
          "left-[var(--dashboard-sidebar-offset,0px)] right-0",
          "transition-[left] duration-300",
          className
        )}
      >
        {/* Soft lift halo so the bar separates from list cards */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-primary/20 blur-2xl" />

        <div
          className={cn(
            "pointer-events-auto relative w-full max-w-2xl",
            "flex flex-wrap items-center justify-between gap-2 sm:gap-3",
            "rounded-full border-2 border-primary/35 bg-white",
            "px-3 py-2.5 sm:px-5",
            "shadow-[0_18px_50px_-12px_rgba(67,97,238,0.45),0_8px_24px_-8px_rgba(15,23,42,0.25)]",
            "ring-4 ring-primary/10"
          )}
          role="navigation"
          aria-label="Pagination"
        >
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            aria-hidden
          />

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 pl-1 sm:pl-1.5">
            <p className="hidden truncate text-sm text-neutral-muted md:block">
              <span className="font-bold text-neutral-text tabular-nums">
                {from}–{to}
              </span>
              <span className="mx-1.5 text-neutral-border">of</span>
              <span className="font-bold text-primary tabular-nums">{total}</span>{" "}
              <span className="font-medium text-neutral-muted">{itemLabel}</span>
            </p>
            <p className="truncate text-sm font-bold text-neutral-text tabular-nums md:hidden">
              {from}–{to}{" "}
              <span className="font-semibold text-primary">/ {total}</span>
            </p>

            <span className="hidden h-5 w-px bg-primary/20 sm:block" />

            <label className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-neutral-muted">
              <span className="hidden sm:inline">Per page</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className={cn(
                  "h-9 rounded-full border-2 border-primary/20 bg-primary/[0.04] px-3 pr-8",
                  "text-sm font-bold text-neutral-text",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25",
                  "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%234361ee%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.55rem_center] bg-no-repeat"
                )}
                aria-label="Items per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showPageNav ? (
            <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1 rounded-full bg-primary/[0.06] p-1">
              <Link
                href={buildHref(pathname, searchParams, page - 1)}
                aria-disabled={!hasPrev}
                tabIndex={hasPrev ? 0 : -1}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  hasPrev
                    ? "text-neutral-text hover:bg-white hover:text-primary hover:shadow-soft"
                    : "pointer-events-none text-neutral-muted/40"
                )}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <div className="hidden items-center gap-0.5 sm:flex">
                {pages.map((entry, idx) =>
                  entry === "ellipsis" ? (
                    <span
                      key={`e-${idx}`}
                      className="px-1 text-xs text-neutral-muted"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={entry}
                      href={buildHref(pathname, searchParams, entry)}
                      aria-current={entry === page ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-2.5 text-sm font-bold transition-colors",
                        entry === page
                          ? "bg-primary text-white shadow-button"
                          : "text-neutral-text hover:bg-white hover:text-primary hover:shadow-soft"
                      )}
                    >
                      {entry}
                    </Link>
                  )
                )}
              </div>

              <span className="px-2 text-sm font-bold tabular-nums text-primary sm:hidden">
                {page}/{totalPages}
              </span>

              <Link
                href={buildHref(pathname, searchParams, page + 1)}
                aria-disabled={!hasNext}
                tabIndex={hasNext ? 0 : -1}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  hasNext
                    ? "text-neutral-text hover:bg-white hover:text-primary hover:shadow-soft"
                    : "pointer-events-none text-neutral-muted/40"
                )}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          ) : (
            <span className="pr-2 text-xs font-semibold text-primary/80">
              All on this page
            </span>
          )}
        </div>
      </div>
    </>
  );
}
