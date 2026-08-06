"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter, Grid, LayoutGrid, List, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { isCampaignsEnabled } from "@/lib/features";
import { FolderPicker } from "@/components/ui/folder-picker";
import { resetPageParam } from "@/lib/utils/pagination";

type ViewType = "list" | "grid" | "card";
type StatusFilter = "active" | "all" | "archived";
type DateFilter = "today" | "last7days" | "last30days" | "thismonth" | "lastmonth" | "custom" | null;

interface LinksControlsProps {
  initialSearch?: string;
  initialView?: ViewType;
  initialStatus?: StatusFilter;
  initialDateFilter?: string | null;
  initialTag?: string;
  initialFolder?: string;
  initialCampaignId?: string;
  availableFolders?: string[];
  availableTags?: string[];
  selectedCount: number;
  onViewChange?: (view: ViewType) => void;
  navigate?: (href: string) => void;
  isPending?: boolean;
}

export function LinksControls({
  initialSearch = "",
  initialView = "list",
  initialStatus = "active",
  initialDateFilter,
  initialTag = "",
  initialFolder = "",
  initialCampaignId = "",
  availableFolders = [],
  availableTags = [],
  selectedCount,
  onViewChange,
  navigate,
  isPending = false,
}: LinksControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [dateFilter, setDateFilter] = useState<DateFilter>((initialDateFilter || searchParams.get("dateFilter")) as DateFilter || null);
  const [tagFilter, setTagFilter] = useState(initialTag || searchParams.get("tag") || "");
  const [folderFilter, setFolderFilter] = useState(initialFolder || searchParams.get("folder") || "");
  const [campaignIdFilter, setCampaignIdFilter] = useState(
    initialCampaignId || searchParams.get("campaign_id") || ""
  );
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const push = (href: string) => {
    if (navigate) navigate(href);
    else router.push(href);
  };

  useEffect(() => {
    if (!isCampaignsEnabled()) return;
    void (async () => {
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(
            (Array.isArray(data) ? data : []).map((c: any) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Update URL when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") || "";
      if (search === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      resetPageParam(params);
      push(`/dashboard/links?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on search text
  }, [search]);

  const handleViewChange = (view: ViewType) => {
    setViewType(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    push(`/dashboard/links?${params.toString()}`);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    resetPageParam(params);
    push(`/dashboard/links?${params.toString()}`);
  };

  const handleDateFilter = (filter: DateFilter) => {
    setDateFilter(filter);
    setShowDateMenu(false);
    const params = new URLSearchParams(searchParams.toString());
    if (filter) {
      params.set("dateFilter", filter);
    } else {
      params.delete("dateFilter");
    }
    resetPageParam(params);
    push(`/dashboard/links?${params.toString()}`);
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

  const applyFolderFilter = (folder: string) => {
    setFolderFilter(folder);
    const params = new URLSearchParams(searchParams.toString());
    if (folder) params.set("folder", folder);
    else params.delete("folder");
    resetPageParam(params);
    push(`/dashboard/links?${params.toString()}`);
  };

  const hasMetaFilters = Boolean(tagFilter || folderFilter || campaignIdFilter);

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
        <div className="flex-1 relative min-w-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-11 rounded-full bg-white border border-neutral-border/80 shadow-soft focus:border-primary focus:ring-2 focus:ring-primary/25 text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {availableFolders.length > 0 && (
          <FolderPicker
            compact
            value={folderFilter}
            options={availableFolders}
            onChange={applyFolderFilter}
            emptyLabel="All folders"
            placeholder="Folder"
            className="w-full sm:w-44"
          />
        )}
        <div className="relative flex-1 sm:flex-none" ref={dateMenuRef}>
          <button
            onClick={() => {
              setShowDateMenu(!showDateMenu);
              setShowFilterMenu(false);
            }}
            disabled={isPending}
            className={cn(
              "w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-full border text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-soft",
              dateFilter
                ? "border-primary/30 text-primary bg-primary/10"
                : "border-neutral-border/80 bg-white hover:border-primary/30 hover:text-primary text-neutral-text",
              isPending && "opacity-70 cursor-wait"
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span className="truncate max-w-[7rem] sm:max-w-none">{getDateFilterLabel()}</span>
            {dateFilter && !isPending && (
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
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-neutral-border/80 shadow-float z-50 py-2">
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
        <div className="relative flex-1 sm:flex-none" ref={filterMenuRef}>
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowDateMenu(false);
            }}
            className={cn(
              "w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-full border text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-soft",
              hasMetaFilters
                ? "border-primary/30 text-primary bg-primary/10"
                : "border-neutral-border/80 bg-white hover:border-primary/30 hover:text-primary text-neutral-text"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="sm:inline">Filters</span>
            {hasMetaFilters && (
              <span className="ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {[tagFilter, folderFilter, campaignIdFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-border/80 shadow-float z-50 py-2">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-muted uppercase">Filter by</div>
              <div className="px-4 py-2 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-muted mb-1">Tag</label>
                  {availableTags.length > 0 ? (
                    <select
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 bg-white"
                    >
                      <option value="">All tags</option>
                      {availableTags.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      placeholder="No tags yet"
                      disabled
                      className="w-full px-3 py-2 rounded-xl border border-neutral-border/80 text-sm bg-neutral-bg text-neutral-muted"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-muted mb-1">Folder</label>
                  <FolderPicker
                    value={folderFilter}
                    options={availableFolders}
                    onChange={setFolderFilter}
                    emptyLabel="All folders"
                    placeholder="Select folder"
                    triggerClassName="h-10 !border border-neutral-border/80 rounded-xl text-sm"
                  />
                </div>
                {isCampaignsEnabled() && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-muted mb-1">Campaign</label>
                    <select
                      value={campaignIdFilter}
                      onChange={(e) => setCampaignIdFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 bg-white"
                    >
                      <option value="">All campaigns</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-border my-1" />
              <div className="px-4 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTagFilter("");
                    setFolderFilter("");
                    setCampaignIdFilter("");
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("tag");
                    params.delete("folder");
                    params.delete("campaign_id");
                    resetPageParam(params);
                    push(`/dashboard/links?${params.toString()}`);
                    setShowFilterMenu(false);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-border text-neutral-muted hover:text-neutral-text"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (tagFilter.trim()) params.set("tag", tagFilter.trim());
                    else params.delete("tag");
                    if (folderFilter.trim()) params.set("folder", folderFilter.trim());
                    else params.delete("folder");
                    if (campaignIdFilter.trim()) params.set("campaign_id", campaignIdFilter.trim());
                    else params.delete("campaign_id");
                    resetPageParam(params);
                    push(`/dashboard/links?${params.toString()}`);
                    setShowFilterMenu(false);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white shadow-button hover:bg-bright-indigo transition-all"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(dateFilter || tagFilter || folderFilter || campaignIdFilter || isPending) && (
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
          {tagFilter && (
            <div className="px-3 py-1.5 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20 flex items-center gap-2">
              <span className="text-xs font-semibold text-electric-sapphire">
                Tag: {tagFilter}
              </span>
              <button
                onClick={() => {
                  setTagFilter("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("tag");
                  resetPageParam(params);
                  push(`/dashboard/links?${params.toString()}`);
                }}
                className="hover:bg-electric-sapphire/20 rounded p-0.5"
              >
                <X className="h-3 w-3 text-electric-sapphire" />
              </button>
            </div>
          )}
          {folderFilter && (
            <div className="px-3 py-1.5 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20 flex items-center gap-2">
              <span className="text-xs font-semibold text-electric-sapphire">
                Folder: {folderFilter}
              </span>
              <button
                onClick={() => {
                  setFolderFilter("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("folder");
                  resetPageParam(params);
                  push(`/dashboard/links?${params.toString()}`);
                }}
                className="hover:bg-electric-sapphire/20 rounded p-0.5"
              >
                <X className="h-3 w-3 text-electric-sapphire" />
              </button>
            </div>
          )}
          {campaignIdFilter && (
            <div className="px-3 py-1.5 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20 flex items-center gap-2">
              <span className="text-xs font-semibold text-electric-sapphire">
                Campaign:{" "}
                {campaigns.find((c) => c.id === campaignIdFilter)?.name || "Selected"}
              </span>
              <button
                onClick={() => {
                  setCampaignIdFilter("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("campaign_id");
                  resetPageParam(params);
                  push(`/dashboard/links?${params.toString()}`);
                }}
                className="hover:bg-electric-sapphire/20 rounded p-0.5"
              >
                <X className="h-3 w-3 text-electric-sapphire" />
              </button>
            </div>
          )}
          {isPending && (
            <div className="px-3 py-1.5 rounded-lg bg-neutral-bg border border-neutral-border flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-electric-sapphire" />
              <span className="text-xs font-medium text-neutral-muted">Updating list…</span>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-card border border-neutral-border/80 shadow-soft">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="text-sm font-medium text-neutral-muted shrink-0">
            {selectedCount} selected
          </span>
          {selectedCount > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors flex items-center gap-1.5 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors shrink-0">
                Hide
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-neutral-text hover:bg-white transition-colors shrink-0">
                Tag
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 bg-neutral-surface/80 rounded-full border border-neutral-border/80">
            <button
              onClick={() => handleViewChange("list")}
              className={cn(
                "p-1.5 rounded-full transition-all",
                viewType === "list"
                  ? "bg-white text-primary shadow-soft"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewChange("grid")}
              className={cn(
                "p-1.5 rounded-full transition-all",
                viewType === "grid"
                  ? "bg-white text-primary shadow-soft"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewChange("card")}
              className={cn(
                "p-1.5 rounded-full transition-all",
                viewType === "card"
                  ? "bg-white text-primary shadow-soft"
                  : "text-neutral-muted hover:text-neutral-text"
              )}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
            className="px-2 sm:px-3 py-2 rounded-full border border-neutral-border/80 text-sm font-semibold text-neutral-text bg-white shadow-soft focus:outline-none focus:border-primary transition-all min-w-0"
          >
            <option value="active">Active</option>
            <option value="all">All</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </>
  );
}

