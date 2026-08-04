"use client";

import { useMemo, useState } from "react";
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsSummary {
  views: number;
  clicks: number;
  overallCtr: number;
  timeSeries: Array<{ date: string; views: number; clicks: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  perLinkCtr: Array<{ linkId: string; title: string; clicks: number; ctr: number }>;
}

export function PageAnalyticsClient({
  page,
  analytics,
}: {
  page: any;
  analytics: AnalyticsSummary;
}) {
  const [copied, setCopied] = useState(false);

  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success("Page URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      } catch {
        // cancelled
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

  const viewCount = page.view_count || analytics.views || 0;
  const clickCount = page.click_count || analytics.clicks || 0;
  const clickThroughRate =
    viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(1) : "0.0";

  const timeSeriesData = useMemo(() => {
    const labels = analytics.timeSeries.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    return {
      labels,
      datasets: [
        {
          label: "Views",
          data: analytics.timeSeries.map((d) => d.views),
          borderColor: "rgb(67, 97, 238)",
          backgroundColor: "rgba(67, 97, 238, 0.1)",
          fill: true,
          tension: 0.35,
        },
        {
          label: "Clicks",
          data: analytics.timeSeries.map((d) => d.clicks),
          borderColor: "rgb(236, 72, 153)",
          backgroundColor: "rgba(236, 72, 153, 0.08)",
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }, [analytics.timeSeries]);

  const referrerData = useMemo(() => {
    const top = analytics.topReferrers.slice(0, 6);
    return {
      labels: top.map((r) =>
        r.referrer.length > 24 ? `${r.referrer.slice(0, 24)}…` : r.referrer
      ),
      datasets: [
        {
          label: "Events",
          data: top.map((r) => r.count),
          backgroundColor: "rgba(67, 97, 238, 0.7)",
          borderRadius: 8,
        },
      ],
    };
  }, [analytics.topReferrers]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard/pages"
            prefetch={true}
            className="flex items-center gap-2 text-neutral-muted hover:text-neutral-text transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Pages</span>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-border flex items-center justify-center">
                  <FileText className="h-6 w-6 text-neutral-text" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-text">{page.title}</h1>
                  <p className="text-sm text-neutral-muted mt-1">
                    Created{" "}
                    {new Date(page.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-neutral-border">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">
                    Your Page URL
                  </p>
                  <p className="text-sm font-mono text-neutral-text font-semibold break-all">
                    {pageUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                    copied
                      ? "bg-neutral-bg border-neutral-text text-neutral-text"
                      : "bg-white border-neutral-border text-neutral-text hover:border-neutral-text"
                  )}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl border border-neutral-border bg-white text-neutral-text hover:border-neutral-text transition-all active:scale-[0.98]"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Views", value: formatNumber(viewCount), icon: Eye },
            { label: "Total Clicks", value: formatNumber(clickCount), icon: MousePointerClick },
            { label: "Click-Through Rate", value: `${clickThroughRate}%`, icon: TrendingUp },
            {
              label: "Links on Page",
              value: Array.isArray(page.links) ? page.links.length : 0,
              icon: Link2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-neutral-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-bg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-neutral-text" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-muted mb-1">{label}</p>
              <p className="text-3xl font-bold text-neutral-text">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-neutral-border p-6">
            <h3 className="text-lg font-bold text-neutral-text mb-1">Activity over time</h3>
            <p className="text-xs text-neutral-muted mb-4">Views and clicks · last 30 days</p>
            <div className="h-64">
              {analytics.timeSeries.length > 0 ? (
                <Line data={timeSeriesData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-neutral-muted">
                  No analytics events yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-border p-6">
            <h3 className="text-lg font-bold text-neutral-text mb-1">Top referrers</h3>
            <p className="text-xs text-neutral-muted mb-4">Where traffic comes from</p>
            <div className="h-64">
              {analytics.topReferrers.length > 0 ? (
                <Bar data={referrerData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-neutral-muted">
                  No referrer data yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-neutral-border p-6">
            <h3 className="text-lg font-bold text-neutral-text mb-1">Per-link CTR</h3>
            <p className="text-xs text-neutral-muted mb-4">
              Clicks per link ÷ page views
            </p>
            {analytics.perLinkCtr.length > 0 ? (
              <div className="space-y-3">
                {analytics.perLinkCtr.map((row) => (
                  <div
                    key={row.linkId}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-border"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-text truncate">
                        {row.title}
                      </p>
                      <p className="text-xs text-neutral-muted">{row.clicks} clicks</p>
                    </div>
                    <span className="text-sm font-bold text-neutral-text">{row.ctr}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-muted py-8 text-center">
                Add links to see per-link CTR
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neutral-bg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-neutral-text" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Quick Actions</h3>
                <p className="text-xs text-neutral-muted">Manage your page</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Status
                  </p>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
                      page.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {page.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Visibility
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-neutral-bg text-neutral-text border-neutral-border">
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

            <div className="space-y-3">
              <button
                onClick={() => window.open(pageUrl, "_blank")}
                className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-white text-neutral-text hover:border-neutral-text transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Page
              </button>
              <Link
                href={`/dashboard/pages/${page.id}/edit`}
                prefetch={true}
                className="w-full px-4 py-3 rounded-xl bg-neutral-text text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
