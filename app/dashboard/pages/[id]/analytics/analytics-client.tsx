"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Eye,
  MousePointerClick,
  Calendar,
  Globe,
  Link2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export function PageAnalyticsClient({ page }: { page: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success("Page URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: page.title,
          text: page.description || page.title,
          url: pageUrl,
        });
        toast.success("Page shared!");
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const clickThroughRate = page.view_count > 0
    ? ((page.click_count / page.view_count) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-neutral-bg via-white to-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/pages"
            prefetch={true}
            className="flex items-center gap-2 text-neutral-muted hover:text-neutral-text transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Pages</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vivid-royal/20 to-indigo-bloom/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-vivid-royal" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-text">{page.title}</h1>
                  <p className="text-sm text-neutral-muted mt-1">
                    Created {new Date(page.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Page URL Display */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-neutral-border group hover:border-vivid-royal transition-colors">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">
                    Your Page URL
                  </p>
                  <p className="text-sm font-mono text-vivid-royal font-semibold break-all">
                    {pageUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 transition-all active:scale-[0.98]",
                    copied
                      ? "bg-vivid-royal/10 border-vivid-royal text-vivid-royal"
                      : "bg-white border-neutral-border text-neutral-text hover:border-vivid-royal hover:text-vivid-royal"
                  )}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text hover:border-vivid-royal hover:text-vivid-royal transition-all active:scale-[0.98]"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Views */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-electric-sapphire to-bright-indigo p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Eye className="h-6 w-6" />
                </div>
                <span className="text-4xl">👁️</span>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Total Views</p>
              <p className="text-3xl font-bold">{formatNumber(page.view_count || 0)}</p>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neon-pink to-raspberry-plum p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MousePointerClick className="h-6 w-6" />
                </div>
                <span className="text-4xl">🖱️</span>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold">{formatNumber(page.click_count || 0)}</p>
            </div>
          </div>

          {/* Click-Through Rate */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-energy to-sky-aqua p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-4xl">📈</span>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Click-Through Rate</p>
              <p className="text-3xl font-bold">{clickThroughRate}%</p>
            </div>
          </div>

          {/* Links Count */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vivid-royal to-indigo-bloom p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Link2 className="h-6 w-6" />
                </div>
                <span className="text-4xl">🔗</span>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Links on Page</p>
              <p className="text-3xl font-bold">
                {Array.isArray(page.links) ? page.links.length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Page Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page Info */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-vivid-royal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Page Information</h3>
                <p className="text-xs text-neutral-muted">Details about your page</p>
              </div>
            </div>

            <div className="space-y-4">
              {page.description && (
                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm text-neutral-text">{page.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Status
                  </p>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                      page.is_active
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        page.is_active ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    {page.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Visibility
                  </p>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                      page.is_public
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    {page.is_public ? "Public" : "Private"}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                  Last Updated
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-text">
                  <Calendar className="h-4 w-4 text-neutral-muted" />
                  {new Date(page.updated_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-electric-sapphire" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Quick Actions</h3>
                <p className="text-xs text-neutral-muted">Manage your page</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.open(pageUrl, "_blank")}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Page
              </button>
              <Link
                href={`/dashboard/pages/${page.id}/edit`}
                prefetch={true}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
              >
                <FileText className="h-4 w-4" />
                Edit Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

