"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Globe,
  Users,
  MapPin,
  Link2,
  Copy,
  Check,
  Share2,
  Calendar,
  Zap,
  Activity,
  BarChart3,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function LinkAnalyticsClient({ link, stats }: { link: any; stats: any }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [liveClicks, setLiveClicks] = useState(link.click_count || 0);

  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.short_code}`;

  useEffect(() => {
    // Subscribe to real-time click updates
    const channel = supabase
      .channel(`link-analytics:${link.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "links",
          filter: `id=eq.${link.id}`,
        },
        (payload) => {
          const updatedLink = payload.new as any;
          setLiveClicks(updatedLink.click_count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [link.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title || "Check out this link",
          text: "Shortened link",
          url: shortUrl,
        });
        toast.success("Link shared!");
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

  // Prepare chart data
  const clicksOverTimeData = {
    labels: stats?.clicks_by_date?.map((item: any) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ) || [],
    datasets: [
      {
        label: "Clicks",
        data: stats?.clicks_by_date?.map((item: any) => item.count) || [],
        borderColor: "rgb(67, 97, 238)",
        backgroundColor: "rgba(67, 97, 238, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(67, 97, 238)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const clicksOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6B7280",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          font: {
            size: 12,
          },
          color: "#6B7280",
          callback: function(value: any) {
            if (Number.isInteger(value)) {
              return value;
            }
            return '';
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Traffic Sources - Donut Chart (proportions)
  const trafficSourcesData = {
    labels:
      stats?.top_referrers
        ?.slice(0, 6)
        .map((ref: any) =>
          ref.referrer === "Direct" || !ref.referrer
            ? "Direct"
            : new URL(ref.referrer).hostname.replace("www.", "")
        ) || [],
    datasets: [
      {
        label: "Clicks",
        data: stats?.top_referrers?.slice(0, 6).map((ref: any) => ref.count) || [],
        backgroundColor: [
          "rgba(67, 97, 238, 0.8)",
          "rgba(247, 37, 133, 0.8)",
          "rgba(181, 23, 158, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(72, 149, 239, 0.8)",
          "rgba(76, 201, 240, 0.8)",
        ],
        borderColor: [
          "rgb(67, 97, 238)",
          "rgb(247, 37, 133)",
          "rgb(181, 23, 158)",
          "rgb(114, 9, 183)",
          "rgb(72, 149, 239)",
          "rgb(76, 201, 240)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const trafficSourcesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const geographicData = {
    labels: stats?.clicks_by_country?.slice(0, 10).map((c: any) => c.country) || [],
    datasets: [
      {
        label: "Clicks",
        data: stats?.clicks_by_country?.slice(0, 10).map((c: any) => c.count) || [],
        backgroundColor: [
          "rgba(72, 149, 239, 0.8)",
          "rgba(76, 201, 240, 0.8)",
          "rgba(67, 97, 238, 0.8)",
          "rgba(63, 55, 201, 0.8)",
          "rgba(58, 12, 163, 0.8)",
          "rgba(72, 12, 168, 0.8)",
          "rgba(86, 11, 173, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(181, 23, 158, 0.8)",
          "rgba(247, 37, 133, 0.8)",
        ],
        borderColor: [
          "rgb(72, 149, 239)",
          "rgb(76, 201, 240)",
          "rgb(67, 97, 238)",
          "rgb(63, 55, 201)",
          "rgb(58, 12, 163)",
          "rgb(72, 12, 168)",
          "rgb(86, 11, 173)",
          "rgb(114, 9, 183)",
          "rgb(181, 23, 158)",
          "rgb(247, 37, 133)",
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const geographicOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "600" as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#6B7280",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6B7280",
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/links"
            prefetch={true}
            className="flex items-center gap-2 text-neutral-muted hover:text-neutral-text transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Links</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-electric-sapphire" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-text">
                    {link.title || "Link Analytics"}
                  </h1>
                  <p className="text-sm text-neutral-muted mt-1">
                    Created {new Date(link.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Link Display */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-neutral-border">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">
                    Your Short Link
                  </p>
                  <p className="text-sm font-mono text-electric-sapphire font-semibold break-all">
                    {shortUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                    copied
                      ? "bg-electric-sapphire/10 border-electric-sapphire text-electric-sapphire"
                      : "bg-white border-neutral-border text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire"
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl border border-neutral-border bg-white text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire transition-all active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Clicks */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-electric-sapphire" />
              </div>
            </div>
            <p className="text-sm font-semibold text-neutral-muted mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-neutral-text">{formatNumber(liveClicks)}</p>
            {stats && (
              <p className="text-xs text-neutral-muted mt-2">
                {stats.unique_clicks || 0} unique visitors
              </p>
            )}
          </div>

          {/* Unique Visitors */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-neon-pink" />
              </div>
            </div>
            <p className="text-sm font-semibold text-neutral-muted mb-1">Unique Visitors</p>
            <p className="text-3xl font-bold text-neutral-text">
              {formatNumber(stats?.unique_clicks || 0)}
            </p>
            {stats && liveClicks > 0 && (
              <p className="text-xs text-neutral-muted mt-2">
                {((stats.unique_clicks / liveClicks) * 100).toFixed(1)}% return rate
              </p>
            )}
          </div>

          {/* Top Country */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-energy" />
              </div>
            </div>
            <p className="text-sm font-semibold text-neutral-muted mb-1">Top Location</p>
            <p className="text-2xl font-bold text-neutral-text">
              {stats?.clicks_by_country?.[0]?.country || "N/A"}
            </p>
            {stats?.clicks_by_country?.[0] && (
              <p className="text-xs text-neutral-muted mt-2">
                {stats.clicks_by_country[0].count} clicks
              </p>
            )}
          </div>

          {/* Top Source */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-vivid-royal" />
              </div>
            </div>
            <p className="text-sm font-semibold text-neutral-muted mb-1">Top Source</p>
            <p className="text-lg font-bold text-neutral-text truncate">
              {stats?.top_referrers?.[0]?.referrer
                ? new URL(stats.top_referrers[0].referrer).hostname.replace("www.", "")
                : "Direct"}
            </p>
            {stats?.top_referrers?.[0] && (
              <p className="text-xs text-neutral-muted mt-2">
                {stats.top_referrers[0].count} visits
              </p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Clicks Over Time */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-electric-sapphire" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Clicks Over Time</h3>
                  <p className="text-xs text-neutral-muted">Last 30 days</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-electric-sapphire/10 border border-electric-sapphire/20">
                <span className="text-xs font-semibold text-electric-sapphire">Live</span>
              </div>
            </div>

            {stats?.clicks_by_date?.length > 0 ? (
              <div className="h-80">
                <Line data={clicksOverTimeData} options={clicksOverTimeOptions} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-electric-sapphire/60" />
                </div>
                <p className="text-sm text-neutral-muted">
                  No clicks yet. Share your link to see analytics!
                </p>
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-neon-pink" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Traffic Sources</h3>
                <p className="text-xs text-neutral-muted">Where your clicks come from</p>
              </div>
            </div>

            {stats?.top_referrers?.length > 0 ? (
              <div className="h-64">
                <Doughnut data={trafficSourcesData} options={trafficSourcesOptions} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-neon-pink/60" />
                </div>
                <p className="text-sm text-neutral-muted">
                  No referrer data yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* UTM Parameters Info Card - Show configured UTM parameters for this link */}
        {link.utm_parameters && Object.keys(link.utm_parameters).length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-vivid-royal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">UTM Parameters</h3>
                <p className="text-xs text-neutral-muted">Configured tracking parameters for this link</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {link.utm_parameters.utm_source && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-vivid-royal/5 to-indigo-bloom/5 border border-vivid-royal/10">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Source</p>
                  <p className="text-sm font-semibold text-neutral-text">{link.utm_parameters.utm_source}</p>
                </div>
              )}
              {link.utm_parameters.utm_medium && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-vivid-royal/5 to-indigo-bloom/5 border border-vivid-royal/10">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Medium</p>
                  <p className="text-sm font-semibold text-neutral-text">{link.utm_parameters.utm_medium}</p>
                </div>
              )}
              {link.utm_parameters.utm_campaign && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-vivid-royal/5 to-indigo-bloom/5 border border-vivid-royal/10">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Campaign</p>
                  <p className="text-sm font-semibold text-neutral-text truncate">{link.utm_parameters.utm_campaign}</p>
                </div>
              )}
              {link.utm_parameters.utm_term && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-vivid-royal/5 to-indigo-bloom/5 border border-vivid-royal/10">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Term</p>
                  <p className="text-sm font-semibold text-neutral-text truncate">{link.utm_parameters.utm_term}</p>
                </div>
              )}
              {link.utm_parameters.utm_content && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-vivid-royal/5 to-indigo-bloom/5 border border-vivid-royal/10">
                  <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Content</p>
                  <p className="text-sm font-semibold text-neutral-text truncate">{link.utm_parameters.utm_content}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-muted mt-4">
              View aggregated UTM analytics across all your links in the{" "}
              <Link href="/dashboard/analytics" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
                Analytics Overview
              </Link>
            </p>
          </div>
        )}

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-energy" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text">Geographic Distribution</h3>
              <p className="text-xs text-neutral-muted">Clicks by country</p>
            </div>
          </div>

          {stats?.clicks_by_country?.length > 0 ? (
            <div className="h-64">
              <Bar data={geographicData} options={geographicOptions} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-energy/60" />
              </div>
              <p className="text-sm text-neutral-muted">
                No geographic data yet
              </p>
            </div>
          )}
        </div>

        {/* Link Details */}
        <div className="mt-6 bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-vivid-royal" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text">Link Details</h3>
              <p className="text-xs text-neutral-muted">Quick information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                Original URL
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-bg border border-neutral-border">
                <ExternalLink className="h-4 w-4 text-neutral-muted flex-shrink-0" />
                <a
                  href={link.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-electric-sapphire hover:text-bright-indigo font-medium truncate"
                >
                  {link.original_url}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                  Status
                </p>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                    link.is_active
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      link.is_active ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  {link.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              {link.expires_at && (
                <div>
                  <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                    Expires
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-text">
                    <Calendar className="h-4 w-4 text-neutral-muted" />
                    {new Date(link.expires_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
