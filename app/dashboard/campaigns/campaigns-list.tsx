"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Monitor,
  Calendar,
  TrendingUp,
  Link2,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  Plus,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import type { Campaign, CampaignWithStats } from "@/types/database.types";

export function CampaignsList({ campaigns }: { campaigns: (Campaign | CampaignWithStats)[] }) {
  const router = useRouter();
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? Links will not be deleted, but they will be unassigned from this campaign.")) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Campaign deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCampaigns(newSelected);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (campaigns.length === 0) {
    return (
      <div className="space-y-8">
        {/* Main Empty State */}
        <div className="text-center py-16 bg-white rounded-card shadow-soft border border-neutral-border">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-vivid-royal/20 to-indigo-bloom/20 flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-12 w-12 text-vivid-royal" />
          </div>
          <h3 className="text-3xl font-bold text-neutral-text mb-3">
            Organize your links with campaigns
          </h3>
          <p className="text-base text-neutral-muted mb-8 max-w-2xl mx-auto">
            Campaigns help you group related links together, track performance across marketing initiatives, and analyze which strategies drive the most engagement.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
          >
            <Plus className="h-4 w-4" />
            Create Your First Campaign
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-electric-sapphire" />
            </div>
            <h4 className="text-lg font-bold text-neutral-text mb-2">
              Organize by initiative
            </h4>
            <p className="text-sm text-neutral-muted">
              Group links by product launches, seasonal promotions, or marketing channels to keep everything organized.
            </p>
          </div>

          <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-neon-pink" />
            </div>
            <h4 className="text-lg font-bold text-neutral-text mb-2">
              Track performance
            </h4>
            <p className="text-sm text-neutral-muted">
              See aggregated analytics across all links in a campaign to understand which strategies work best.
            </p>
          </div>

          <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-blue-energy" />
            </div>
            <h4 className="text-lg font-bold text-neutral-text mb-2">
              Quick insights
            </h4>
            <p className="text-sm text-neutral-muted">
              Get instant visibility into total clicks, unique visitors, and top-performing links for each campaign.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-vivid-royal/5 via-indigo-bloom/5 to-ultrasonic-blue/5 rounded-card border border-vivid-royal/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/20 to-indigo-bloom/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-vivid-royal" />
            </div>
            <h4 className="text-xl font-bold text-neutral-text">How campaigns work</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-vivid-royal text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Create a campaign</h5>
                  <p className="text-sm text-neutral-muted">
                    Set a name, description, and optional start/end dates for your marketing initiative.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-vivid-royal text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Assign links</h5>
                  <p className="text-sm text-neutral-muted">
                    When creating or editing links, assign them to your campaign to group related content.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-vivid-royal text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Track analytics</h5>
                  <p className="text-sm text-neutral-muted">
                    View aggregated performance metrics, top referrers, geographic data, and more for each campaign.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-vivid-royal text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h5 className="font-semibold text-neutral-text mb-1">Optimize strategy</h5>
                  <p className="text-sm text-neutral-muted">
                    Compare campaign performance to identify what resonates with your audience and improve results.
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
    <div className="space-y-0">
      {campaigns.map((campaign, index) => {
        const isSelected = selectedCampaigns.has(campaign.id);

        return (
          <div
            key={campaign.id}
            className={cn(
              "bg-white border-b border-neutral-border p-5",
              "hover:bg-neutral-bg transition-colors",
              index === 0 && "rounded-t-card border-t",
              index === campaigns.length - 1 && "rounded-b-card border-b"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(campaign.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer"
                />
              </div>

              {/* Campaign Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-vivid-royal/20 to-indigo-bloom/20 flex items-center justify-center border-2 border-vivid-royal/20">
                  <Monitor className="h-8 w-8 text-vivid-royal" />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-neutral-text">
                      {campaign.name}
                    </h3>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-neutral-muted mb-3">
                      {campaign.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-neutral-muted">
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
                    <span>{(campaign as CampaignWithStats).total_links || 0} links</span>
                  </div>
                  {(campaign as CampaignWithStats).total_clicks !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{(campaign as CampaignWithStats).total_clicks || 0} clicks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/dashboard/campaigns/${campaign.id}/analytics`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Link>
                <Link
                  href={`/dashboard/campaigns/${campaign.id}/edit`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* End of Campaigns Indicator */}
      {campaigns.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 text-sm text-neutral-muted">
            <div className="h-px w-12 bg-neutral-border" />
            <span>You've reached the end of your campaigns</span>
            <div className="h-px w-12 bg-neutral-border" />
          </div>
        </div>
      )}
    </div>
  );
}

