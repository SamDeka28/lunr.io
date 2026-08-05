"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Monitor,
  Calendar,
  TrendingUp,
  Link2,
  Edit,
  Trash2,
  BarChart3,
  Plus,
  Target,
  Activity,
  Sparkles,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import type { Campaign, CampaignWithStats } from "@/types/database.types";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CampaignCompare } from "./campaign-compare";

function CampaignStatusChip({ campaign }: { campaign: Campaign }) {
  const status = (() => {
    if (campaign.is_active === false) return "archived" as const;
    const now = Date.now();
    if (campaign.start_date) {
      const start = new Date(campaign.start_date).getTime();
      if (!Number.isNaN(start) && now < start) return "scheduled" as const;
    }
    if (campaign.end_date) {
      const end = new Date(campaign.end_date).getTime();
      if (!Number.isNaN(end) && now > end) return "ended" as const;
    }
    return "active" as const;
  })();

  const styles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    scheduled: "bg-sky-50 text-sky-700 border-sky-100",
    ended: "bg-amber-50 text-amber-700 border-amber-100",
    archived: "bg-neutral-bg text-neutral-muted border-neutral-border",
  };

  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

export function CampaignsList({ campaigns }: { campaigns: (Campaign | CampaignWithStats)[] }) {
  const router = useRouter();
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this campaign? Links will stay active but will be unassigned from the campaign.")) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Campaign archived");
        router.refresh();
      } else {
        toast.error("Failed to archive campaign");
      }
    } catch {
      toast.error("Failed to archive campaign");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          const [, keep] = Array.from(next);
          next.clear();
          if (keep) next.add(keep);
        }
        next.add(id);
      }
      if (next.size !== 2) setComparing(false);
      return next;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedIds = Array.from(selectedCampaigns);

  if (campaigns.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={<Monitor className="h-8 w-8" />}
          title="Run your first campaign"
          description="Start with an influencer campaign—add creators, generate unique tracking links, log fees—or use the same workspace for email, paid, and launch campaigns."
          action={
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Your First Campaign
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-surface flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-neutral-muted" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-text mb-2">
              Organize by initiative
            </h4>
            <p className="text-sm text-neutral-muted">
              Group links by product launches, seasonal promotions, or marketing channels.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-surface flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-neutral-muted" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-text mb-2">
              Track performance
            </h4>
            <p className="text-sm text-neutral-muted">
              See aggregated analytics, CPC from budget, and progress toward click targets.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-surface flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-neutral-muted" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-text mb-2">
              Compare campaigns
            </h4>
            <p className="text-sm text-neutral-muted">
              Pick two campaigns to compare clicks, unique visitors, and efficiency side by side.
            </p>
          </div>
        </div>

        <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-neutral-border">
              <Sparkles className="h-5 w-5 text-neutral-muted" />
            </div>
            <h4 className="text-xl font-semibold text-neutral-text">How campaigns work</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-text text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Create a campaign</h5>
                  <p className="text-sm text-neutral-muted">
                    Set dates, budget, targets, and default UTM parameters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-text text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Assign links</h5>
                  <p className="text-sm text-neutral-muted">
                    Campaign UTM defaults merge into assigned links (link values win).
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-text text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Track analytics</h5>
                  <p className="text-sm text-neutral-muted">
                    View CPC, goal progress, and aggregated click metrics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-text text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Compare & optimize</h5>
                  <p className="text-sm text-neutral-muted">
                    Select two campaigns on the list to compare performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-neutral-border shadow-soft px-4 py-3">
          <p className="text-sm text-neutral-muted">
            {selectedIds.length === 1
              ? "Select one more campaign to compare"
              : "2 campaigns selected"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCampaigns(new Set());
                setComparing(false);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.length !== 2}
              onClick={() => setComparing(true)}
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>
      )}

      {comparing && selectedIds.length === 2 && (
        <CampaignCompare
          campaignIds={[selectedIds[0], selectedIds[1]]}
          onClose={() => setComparing(false)}
        />
      )}

      <div className="space-y-0 rounded-2xl border border-neutral-border overflow-hidden bg-white shadow-soft">
        {campaigns.map((campaign, index) => {
          const isSelected = selectedCampaigns.has(campaign.id);
          const stats = campaign as CampaignWithStats;

          return (
            <div
              key={campaign.id}
              className={cn(
                "bg-white border-b border-neutral-border p-5",
                "hover:bg-neutral-surface/60 transition-colors",
                index === campaigns.length - 1 && "border-b-0",
                isSelected && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(campaign.id)}
                    className="w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary/40 cursor-pointer"
                    aria-label={`Select ${campaign.name}`}
                  />
                </div>

                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-neutral-surface flex items-center justify-center border border-neutral-border">
                    <Monitor className="h-7 w-7 text-neutral-muted" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="text-lg font-semibold text-neutral-text mb-1 hover:text-primary transition-colors inline-block"
                    >
                      {campaign.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <CampaignStatusChip campaign={campaign} />
                      {campaign.campaign_type && (
                        <span className="text-[11px] font-medium text-neutral-muted px-2 py-0.5 rounded-full bg-neutral-bg border border-neutral-border/80 capitalize">
                          {campaign.campaign_type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-neutral-muted line-clamp-2 mt-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {campaign.start_date && campaign.end_date
                          ? `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`
                          : campaign.start_date
                          ? `Started ${formatDate(campaign.start_date)}`
                          : "No dates set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5" />
                      <span>{stats.total_links || 0} links</span>
                    </div>
                    {stats.total_clicks !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{stats.total_clicks || 0} clicks</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="px-3.5 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-button hover:bg-bright-indigo transition-colors"
                  >
                    Open workspace
                  </Link>
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}?tab=analytics`}
                    className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}/edit`}
                    className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface transition-colors"
                    title="Edit settings"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 rounded-xl text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Archive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {campaigns.length > 0 && (
        <div className="text-center py-4">
          <span className="text-sm text-neutral-muted">
            You&apos;ve reached the end of your campaigns
          </span>
        </div>
      )}
    </div>
  );
}
