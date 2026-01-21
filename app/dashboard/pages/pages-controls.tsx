"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter, Grid, LayoutGrid, List, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

type ViewType = "list" | "grid" | "card";
type StatusFilter = "active" | "all" | "archived";
type DateFilter = "today" | "last7days" | "last30days" | "thismonth" | "lastmonth" | "custom" | null;

interface PagesControlsProps {
  initialSearch?: string;
  initialView?: ViewType;
  initialStatus?: StatusFilter;
  initialDateFilter?: string | null;
  selectedCount: number;
  onViewChange?: (view: ViewType) => void;
}

export function PagesControls({
  initialSearch = "",
  initialView = "list",
  initialStatus = "active",
  initialDateFilter,
  selectedCount,
  onViewChange,
}: PagesControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [dateFilter, setDateFilter] = useState<DateFilter>((initialDateFilter || searchParams.get("dateFilter")) as DateFilter || null);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Update URL when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      router.push(`/dashboard/pages?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  const handleViewChange = (view: ViewType) => {
    setViewType(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`/dashboard/pages?${params.toString()}`);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.push(`/dashboard/pages?${params.toString()}`);
  };

  const handleDateFilter = (filter: DateFilter) => {
    setDateFilter(filter);
    setShowDateMenu(false);
    setIsFiltering(true);
    const params = new URLSearchParams(searchParams.toString());
    if (filter) {
      params.set("dateFilter", filter);
    } else {
      params.delete("dateFilter");
    }
    router.push(`/dashboard/pages?${params.toString()}`);
    // Reset loading state after navigation
    setTimeout(() => setIsFiltering(false), 500);
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today": return "Today";
      case "last7days": return "Last 7 days";
      case "last30days": return "Last 30 days";
      case "thismonth": return "This month";
      case "lastmonth": return "Last month";
      case "custom": return "Custom range";
      default: return "Filter by date";
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-11 rounded-xl bg-neutral-bg border-2 border-transparent focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium transition-all"
          />
        </div>
        <div className="relative" ref={dateMenuRef}>
          <button
            onClick={() => {
              setShowDateMenu(!showDateMenu);
              setShowFilterMenu(false);
            }}
            disabled={isFiltering}
            className={cn(
              "px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors flex items-center gap-2",
              dateFilter
                ? "border-electric-sapphire text-electric-sapphire bg-electric-sapphire/10"
                : "border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-neutral-text",
              isFiltering && "opacity-70 cursor-wait"
            )}
          >
            {isFiltering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            {getDateFilterLabel()}
            {dateFilter && !isFiltering && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateFilter(null);
                }}
                className="ml-1 hover:bg-electric-sapphire/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>
          {showDateMenu && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-neutral-border shadow-lg z-50 py-2">
              <button
                onClick={() => handleDateFilter(null)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  !dateFilter
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                All
              </button>
              <div className="border-t border-neutral-border my-1" />
              <button
                onClick={() => handleDateFilter("today")}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  dateFilter === "today"
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                Today
              </button>
              <button
                onClick={() => handleDateFilter("last7days")}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  dateFilter === "last7days"
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                Last 7 days
              </button>
              <button
                onClick={() => handleDateFilter("last30days")}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  dateFilter === "last30days"
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                Last 30 days
              </button>
              <button
                onClick={() => handleDateFilter("thismonth")}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  dateFilter === "thismonth"
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                This month
              </button>
              <button
                onClick={() => handleDateFilter("lastmonth")}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  dateFilter === "lastmonth"
                    ? "bg-electric-sapphire/10 text-electric-sapphire font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                Last month
              </button>
              <div className="border-t border-neutral-border my-1" />
              <button
                onClick={() => {
                  setShowDateMenu(false);
                  toast.info("Custom date range coming soon");
                }}
                className="w-full px-4 py-2 text-left text-sm text-neutral-text hover:bg-neutral-bg transition-colors"
              >
                Custom range...
              </button>
            </div>
          )}
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowDateMenu(false);
            }}
            className="px-4 py-2.5 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Add filters
          </button>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-neutral-border shadow-lg z-50 py-2">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-muted uppercase">Filter by</div>
              <div className="px-4 py-2 space-y-2">
                <label className="flex items-center gap-2 text-sm text-neutral-text">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40" />
                  <span>Has tags</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-text">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40" />
                  <span>No tags</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-text">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40" />
                  <span>Public pages</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-text">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40" />
                  <span>Private pages</span>
                </label>
              </div>
              <div className="border-t border-neutral-border my-1" />
              <div className="px-4 py-2">
                <button className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal transition-all">
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(dateFilter || isFiltering) && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {dateFilter && (
            <div className="px-3 py-1.5 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20 flex items-center gap-2">
              <span className="text-xs font-semibold text-electric-sapphire">
                Date: {getDateFilterLabel()}
              </span>
              <button
                onClick={() => handleDateFilter(null)}
                className="hover:bg-electric-sapphire/20 rounded p-0.5"
              >
                <X className="h-3 w-3 text-electric-sapphire" />
              </button>
            </div>
          )}
          {isFiltering && (
            <div className="px-3 py-1.5 rounded-lg bg-neutral-bg border border-neutral-border flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-electric-sapphire" />
              <span className="text-xs font-medium text-neutral-muted">Applying filters...</span>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl border border-neutral-border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-muted">
            {selectedCount} selected
          </span>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors">
                Hide
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors">
                Tag
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-neutral-border">
            <button
              onClick={() => handleViewChange("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewType === "list"
                  ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire"
                  : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewType === "grid"
                  ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire"
                  : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
              )}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewChange("card")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewType === "card"
                  ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire"
                  : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
              )}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
            className="px-3 py-2 rounded-xl border-2 border-neutral-border text-sm font-semibold text-neutral-text bg-white focus:outline-none focus:border-electric-sapphire transition-colors"
          >
            <option value="active">Show: Active</option>
            <option value="all">Show: All</option>
            <option value="archived">Show: Archived</option>
          </select>
        </div>
      </div>
    </>
  );
}

