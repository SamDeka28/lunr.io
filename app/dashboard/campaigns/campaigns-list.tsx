"use client";

import { useEffect, useRef, useState } from "react";
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
  GitCompare,
  RotateCcw,
  MoreHorizontal,
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

function RowMenu({
  campaignId,
  showArchived,
  onArchive,
  onRestore,
}: {
  campaignId: string;
  showArchived: boolean;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface transition-colors"
        aria-label="Campaign actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 min-w-[10.5rem] rounded-xl border border-neutral-border/80 bg-white shadow-soft p-1">
          <Link
            href={`/dashboard/campaigns/${campaignId}?tab=analytics`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-text hover:bg-neutral-bg"
            onClick={() => setOpen(false)}
          >
            <BarChart3 className="h-3.5 w-3.5 text-neutral-muted" />
            Analytics
          </Link>
          <Link
            href={`/dashboard/campaigns/${campaignId}/edit`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-text hover:bg-neutral-bg"
            onClick={() => setOpen(false)}
          >
            <Edit className="h-3.5 w-3.5 text-neutral-muted" />
            Edit details
          </Link>
          {showArchived ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRestore();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onArchive();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CampaignsList({
  campaigns,
  showArchived = false,
}: {
  campaigns: (Campaign | CampaignWithStats)[];
  showArchived?: boolean;
}) {
  const router = useRouter();
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Archive this campaign? Links will stay active but will be unassigned from the campaign."
      )
    ) {
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

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      if (response.ok) {
        toast.success("Campaign restored");
        router.refresh();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || "Failed to restore campaign");
      }
    } catch {
      toast.error("Failed to restore campaign");
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
      <EmptyState
        icon={<Monitor className="h-8 w-8" />}
        title={showArchived ? "No archived campaigns" : "Create your first campaign"}
        description={
          showArchived
            ? "Archived campaigns will appear here. Restore any time to bring them back."
            : "Group links by launch, channel, or initiative — then measure partners, spend, and conversions in one workspace."
        }
        action={
          showArchived ? (
            <Link href="/dashboard/campaigns">
              <Button variant="outline">Back to active</Button>
            </Link>
          ) : (
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4" />
                New campaign
              </Button>
            </Link>
          )
        }
      />
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
                "bg-white border-b border-neutral-border px-4 py-3.5",
                "hover:bg-neutral-surface/60 transition-colors",
                index === campaigns.length - 1 && "border-b-0",
                isSelected && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(campaign.id)}
                  className="w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary/40 cursor-pointer shrink-0"
                  aria-label={`Select ${campaign.name}`}
                />

                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-neutral-surface items-center justify-center border border-neutral-border shrink-0">
                  <Monitor className="h-5 w-5 text-neutral-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="text-base font-semibold text-neutral-text hover:text-primary transition-colors truncate"
                    >
                      {campaign.name}
                    </Link>
                    <CampaignStatusChip campaign={campaign} />
                    {campaign.campaign_type && (
                      <span className="text-[11px] font-medium text-neutral-muted px-2 py-0.5 rounded-full bg-neutral-bg border border-neutral-border/80 capitalize hidden md:inline">
                        {campaign.campaign_type.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-muted mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {campaign.start_date && campaign.end_date
                        ? `${formatDate(campaign.start_date)} – ${formatDate(campaign.end_date)}`
                        : campaign.start_date
                          ? `Started ${formatDate(campaign.start_date)}`
                          : "No dates"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {stats.total_links || 0} links
                    </span>
                    {stats.total_clicks !== undefined && (
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stats.total_clicks || 0} clicks
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="px-3.5 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-button hover:bg-bright-indigo transition-colors"
                  >
                    Open
                  </Link>
                  <RowMenu
                    campaignId={campaign.id}
                    showArchived={showArchived}
                    onArchive={() => handleDelete(campaign.id)}
                    onRestore={() => handleRestore(campaign.id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
