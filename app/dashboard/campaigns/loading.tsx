import Link from "next/link";
import { Plus } from "lucide-react";

export default function CampaignsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Section - Static, shows immediately */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Campaigns</h1>
            <p className="text-sm text-neutral-muted">
              Organize and track your marketing campaigns
            </p>
          </div>
          <Link
            href="/dashboard/campaigns/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Campaigns List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-border animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-border rounded-lg animate-pulse" />
                <div className="h-3 w-20 bg-neutral-border rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-full bg-neutral-border rounded-lg animate-pulse mb-2" />
            <div className="h-3 w-2/3 bg-neutral-border rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
