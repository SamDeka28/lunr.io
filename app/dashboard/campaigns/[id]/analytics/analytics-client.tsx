"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  TrendingUp,
  Globe,
  Users,
  MapPin,
  Link2,
  Activity,
  BarChart3,
  Smartphone,
  Monitor as MonitorIcon,
  Tablet,
  Chrome,
  Target,
  Clock,
  Calendar as CalendarIcon,
  TrendingDown,
  Zap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
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
import type { CampaignWithStats, Link as LinkType } from "@/types/database.types";

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

export function CampaignAnalyticsClient({
  campaign,
  links,
  clicksByDate,
  topReferrers,
  clicksByCountry,
  clicksByDevice,
  clicksByBrowser,
  clicksByHour,
  clicksByDayOfWeek,
  todayClicks,
  yesterdayClicks,
  thisWeekClicks,
  lastWeekClicks,
}: {
  campaign: CampaignWithStats;
  links: LinkType[];
  clicksByDate: Array<{ date: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  clicksByCountry: Array<{ country: string; count: number }>;
  clicksByDevice: Array<{ device: string; count: number }>;
  clicksByBrowser: Array<{ browser: string; count: number }>;
  clicksByHour: Array<{ hour: number; count: number }>;
  clicksByDayOfWeek: Array<{ day: string; count: number }>;
  todayClicks: number;
  yesterdayClicks: number;
  thisWeekClicks: number;
  lastWeekClicks: number;
}) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const clicksOverTimeData = {
    labels: clicksByDate.map((item) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Clicks",
        data: clicksByDate.map((item) => item.count),
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
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "600" as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: "#6B7280" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { font: { size: 12 }, color: "#6B7280", stepSize: 1 },
      },
    },
  };

  const referrersData = {
    labels: topReferrers.map((item) =>
      item.referrer.length > 30 ? item.referrer.substring(0, 30) + "..." : item.referrer
    ),
    datasets: [
      {
        label: "Clicks",
        data: topReferrers.map((item) => item.count),
        backgroundColor: [
          "rgba(67, 97, 238, 0.8)",
          "rgba(247, 37, 133, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(76, 201, 240, 0.8)",
          "rgba(181, 23, 158, 0.8)",
        ],
        borderColor: [
          "rgb(67, 97, 238)",
          "rgb(247, 37, 133)",
          "rgb(114, 9, 183)",
          "rgb(76, 201, 240)",
          "rgb(181, 23, 158)",
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const referrersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "600" as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { font: { size: 12 }, color: "#6B7280", stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: "#6B7280" },
      },
    },
  };

  const countriesData = {
    labels: clicksByCountry.map((item) => item.country),
    datasets: [
      {
        label: "Clicks",
        data: clicksByCountry.map((item) => item.count),
        backgroundColor: [
          "rgba(67, 97, 238, 0.8)",
          "rgba(247, 37, 133, 0.8)",
          "rgba(114, 9, 183, 0.8)",
          "rgba(76, 201, 240, 0.8)",
          "rgba(181, 23, 158, 0.8)",
        ],
        borderColor: [
          "rgb(67, 97, 238)",
          "rgb(247, 37, 133)",
          "rgb(114, 9, 183)",
          "rgb(76, 201, 240)",
          "rgb(181, 23, 158)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const countriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: { color: "#111827", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "600" as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-neutral-bg via-white to-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/campaigns"
            prefetch={true}
            className="flex items-center gap-2 text-neutral-muted hover:text-neutral-text transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Campaigns</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vivid-royal/20 to-indigo-bloom/20 flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-vivid-royal" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-text">{campaign.name}</h1>
                  <p className="text-sm text-neutral-muted mt-1">
                    Created {new Date(campaign.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vivid-royal to-indigo-bloom p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Link2 className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Total Links</p>
              <p className="text-3xl font-bold">{formatNumber(campaign.total_links)}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-electric-sapphire to-bright-indigo p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold">{formatNumber(campaign.total_clicks)}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neon-pink to-raspberry-plum p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Unique Clicks</p>
              <p className="text-3xl font-bold">{formatNumber(campaign.unique_clicks)}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-energy to-sky-aqua p-6 text-white shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-semibold text-white/80 mb-1">Avg. per Link</p>
              <p className="text-3xl font-bold">
                {campaign.total_links > 0
                  ? formatNumber(Math.round(campaign.total_clicks / campaign.total_links))
                  : "0"}
              </p>
            </div>
          </div>
        </div>

        {/* Time-based Comparisons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-electric-sapphire" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-text">Today</h3>
                  <p className="text-xs text-neutral-muted">vs Yesterday</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-text">{todayClicks}</p>
                {yesterdayClicks > 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-semibold mt-1",
                    todayClicks >= yesterdayClicks ? "text-green-600" : "text-red-600"
                  )}>
                    {todayClicks >= yesterdayClicks ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {Math.abs(Math.round(((todayClicks - yesterdayClicks) / yesterdayClicks) * 100))}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-neutral-muted">Yesterday: {yesterdayClicks} clicks</div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-vivid-royal" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-text">This Week</h3>
                  <p className="text-xs text-neutral-muted">vs Last Week</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-text">{thisWeekClicks}</p>
                {lastWeekClicks > 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-semibold mt-1",
                    thisWeekClicks >= lastWeekClicks ? "text-green-600" : "text-red-600"
                  )}>
                    {thisWeekClicks >= lastWeekClicks ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {Math.abs(Math.round(((thisWeekClicks - lastWeekClicks) / lastWeekClicks) * 100))}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-neutral-muted">Last week: {lastWeekClicks} clicks</div>
          </div>
        </div>

        {/* Campaign Goal Progress */}
        {campaign.target_clicks > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-vivid-royal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Campaign Goal</h3>
                <p className="text-xs text-neutral-muted">Target: {formatNumber(campaign.target_clicks)} clicks</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-muted">Progress</span>
                <span className="font-semibold text-neutral-text">
                  {formatNumber(campaign.total_clicks)} / {formatNumber(campaign.target_clicks)} clicks
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-vivid-royal to-indigo-bloom transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min((campaign.total_clicks / campaign.target_clicks) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-neutral-muted">
                {Math.round((campaign.total_clicks / campaign.target_clicks) * 100)}% complete
                {campaign.total_clicks < campaign.target_clicks && (
                  <span className="ml-2">
                    ({formatNumber(campaign.target_clicks - campaign.total_clicks)} clicks remaining)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {clicksByDate.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-electric-sapphire" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Clicks Over Time</h3>
                  <p className="text-xs text-neutral-muted">Last 30 days</p>
                </div>
              </div>
              <div className="h-80">
                <Line data={clicksOverTimeData} options={clicksOverTimeOptions} />
              </div>
            </div>
          )}

          {topReferrers.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Top Referrers</h3>
                  <p className="text-xs text-neutral-muted">Traffic sources</p>
                </div>
              </div>
              <div className="h-80">
                <Bar data={referrersData} options={referrersOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Additional Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {clicksByCountry.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-energy" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Geographic Distribution</h3>
                  <p className="text-xs text-neutral-muted">Clicks by country</p>
                </div>
              </div>
              <div className="h-80">
                <Doughnut data={countriesData} options={countriesOptions} />
              </div>
            </div>
          )}

          {clicksByDevice.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-vivid-royal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Device Breakdown</h3>
                  <p className="text-xs text-neutral-muted">Clicks by device type</p>
                </div>
              </div>
              <div className="space-y-4">
                {clicksByDevice.map((item, index) => {
                  const total = clicksByDevice.reduce((sum, d) => sum + d.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  const colors = [
                    "from-electric-sapphire to-bright-indigo",
                    "from-neon-pink to-raspberry-plum",
                    "from-blue-energy to-sky-aqua",
                  ];
                  const icons = {
                    Mobile: Smartphone,
                    Desktop: MonitorIcon,
                    Tablet: Tablet,
                  };
                  const Icon = icons[item.device as keyof typeof icons] || Smartphone;
                  
                  return (
                    <div key={item.device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-neutral-muted" />
                          <span className="text-sm font-semibold text-neutral-text">{item.device}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-text">{item.count}</span>
                          <span className="text-xs text-neutral-muted ml-2">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-neutral-bg rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full bg-gradient-to-r rounded-full transition-all",
                            colors[index % colors.length]
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Browser and Click Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {clicksByBrowser.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                  <Chrome className="h-5 w-5 text-electric-sapphire" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Browser Breakdown</h3>
                  <p className="text-xs text-neutral-muted">Top browsers</p>
                </div>
              </div>
              <div className="space-y-3">
                {clicksByBrowser.map((item, index) => {
                  const total = clicksByBrowser.reduce((sum, b) => sum + b.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={item.browser} className="flex items-center justify-between p-3 rounded-xl bg-neutral-bg">
                      <span className="text-sm font-semibold text-neutral-text">{item.browser}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-neutral-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-electric-sapphire to-bright-indigo rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-neutral-text w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {clicksByHour.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Click Patterns</h3>
                  <p className="text-xs text-neutral-muted">Clicks by hour of day</p>
                </div>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: clicksByHour.map((item) => {
                      const hour = item.hour;
                      return hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
                    }),
                    datasets: [
                      {
                        label: "Clicks",
                        data: clicksByHour.map((item) => item.count),
                        backgroundColor: "rgba(67, 97, 238, 0.8)",
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        padding: 12,
                        titleFont: { size: 14, weight: "600" as const },
                        bodyFont: { size: 13 },
                        cornerRadius: 8,
                        displayColors: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: "#6B7280", maxRotation: 45 },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0, 0, 0, 0.05)" },
                        ticks: { font: { size: 12 }, color: "#6B7280", stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Day of Week Pattern */}
        {clicksByDayOfWeek.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-blue-energy" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-text">Weekly Pattern</h3>
                <p className="text-xs text-neutral-muted">Clicks by day of week</p>
              </div>
            </div>
            <div className="h-64">
              <Bar
                data={{
                  labels: clicksByDayOfWeek.map((item) => item.day),
                  datasets: [
                    {
                      label: "Clicks",
                      data: clicksByDayOfWeek.map((item) => item.count),
                      backgroundColor: "rgba(76, 201, 240, 0.8)",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      padding: 12,
                      titleFont: { size: 14, weight: "600" as const },
                      bodyFont: { size: 13 },
                      cornerRadius: 8,
                      displayColors: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 12 }, color: "#6B7280" },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0, 0, 0, 0.05)" },
                      ticks: { font: { size: 12 }, color: "#6B7280", stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Campaign Links - Enhanced */}
        {links.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-vivid-royal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-text">Campaign Links</h3>
                  <p className="text-xs text-neutral-muted">{links.length} {links.length === 1 ? "link" : "links"} in this campaign</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {links
                .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
                .map((link, index) => {
                  const avgClicks = campaign.total_links > 0 ? campaign.total_clicks / campaign.total_links : 0;
                  const isTopPerformer = (link.click_count || 0) >= avgClicks;
                  
                  return (
                    <Link
                      key={link.id}
                      href={`/dashboard/links/${link.id}/analytics`}
                      className="flex items-center justify-between p-4 rounded-xl bg-neutral-bg border border-neutral-border hover:bg-gradient-to-r hover:from-electric-sapphire/5 hover:to-bright-indigo/5 hover:border-electric-sapphire/20 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {index === 0 && (link.click_count || 0) > 0 && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vivid-royal to-indigo-bloom flex items-center justify-center">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                          )}
                          {index > 0 && (
                            <div className="w-8 h-8 rounded-lg bg-neutral-border flex items-center justify-center">
                              <span className="text-neutral-muted text-xs font-semibold">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-electric-sapphire font-semibold group-hover:text-bright-indigo transition-colors">
                              /{link.short_code}
                            </span>
                            {isTopPerformer && (link.click_count || 0) > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-vivid-royal/10 to-indigo-bloom/10 text-vivid-royal text-xs font-semibold">
                                Top Performer
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-neutral-muted truncate max-w-md">
                            {link.title || link.original_url}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-2xl font-bold text-neutral-text group-hover:text-electric-sapphire transition-colors">
                          {link.click_count || 0}
                        </div>
                        <div className="text-xs text-neutral-muted">
                          {campaign.total_clicks > 0
                            ? `${Math.round(((link.click_count || 0) / campaign.total_clicks) * 100)}% of total`
                            : "clicks"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

