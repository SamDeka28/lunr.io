import { Calendar, Filter, Grid, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default function PagesLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Section - Static, shows immediately */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Your Pages</h1>
            <p className="text-sm text-neutral-muted">
              Loading...
            </p>
          </div>
          <Link
            href="/dashboard/pages/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
          >
            <span className="text-lg">+</span>
            Create Page
          </Link>
        </div>

        {/* Search and Filter Bar - Static */}
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
              className="w-full pl-11 pr-4 h-11 rounded-xl bg-neutral-bg border-2 border-transparent focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium transition-all"
            />
          </div>
          <button className="px-4 py-2.5 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Filter by date
          </button>
          <button className="px-4 py-2.5 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Add filters
          </button>
        </div>

        {/* Action Bar - Static */}
        <div className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl border border-neutral-border">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-muted">0 selected</span>
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
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-neutral-border">
              <button className="p-1.5 rounded-lg bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire">
                <List className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors">
                <Grid className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors">
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <select className="px-3 py-2 rounded-xl border-2 border-neutral-border text-sm font-semibold text-neutral-text bg-white focus:outline-none focus:border-electric-sapphire transition-colors">
              <option>Show: Active</option>
              <option>Show: All</option>
              <option>Show: Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Only skeleton for the dynamic list content */}
      <div className="space-y-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white border-b border-neutral-border p-5"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox Skeleton */}
              <div className="pt-1">
                <div className="w-4 h-4 bg-neutral-border rounded animate-pulse" />
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="mb-3 space-y-2">
                  <div className="h-5 w-64 bg-neutral-border rounded-lg animate-pulse" />
                  <div className="h-4 w-96 bg-neutral-border rounded-lg animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-neutral-border rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-neutral-border rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-neutral-border rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="h-10 w-10 bg-neutral-border rounded-xl animate-pulse" />
                <div className="h-10 w-10 bg-neutral-border rounded-xl animate-pulse" />
                <div className="h-10 w-10 bg-neutral-border rounded-xl animate-pulse" />
                <div className="h-10 w-10 bg-neutral-border rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
