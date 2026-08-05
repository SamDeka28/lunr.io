"use client";

import { useMemo, type ReactNode } from "react";
import {
  TrendingUp,
  Globe,
  MapPin,
  Target,
  Tag,
  Filter,
  Smartphone,
  Monitor,
  Laptop,
  Loader2,
} from "lucide-react";
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
import { Bar, Doughnut } from "react-chartjs-2";
import { cn } from "@/lib/utils/cn";

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

/** Cool brand palette — blue / cyan / slate, no purple/pink rainbow */
const PALETTE = {
  primary: "rgb(67, 97, 238)",
  primarySoft: "rgba(67, 97, 238, 0.14)",
  cyan: "rgb(14, 165, 233)",
  teal: "rgb(20, 184, 166)",
  slate: "rgb(71, 85, 105)",
  ink: "rgb(17, 24, 39)",
};

const SCALE_BLUE = [
  "rgba(67, 97, 238, 0.95)",
  "rgba(67, 97, 238, 0.78)",
  "rgba(72, 149, 239, 0.72)",
  "rgba(56, 189, 248, 0.68)",
  "rgba(20, 184, 166, 0.65)",
  "rgba(71, 85, 105, 0.55)",
  "rgba(100, 116, 139, 0.45)",
  "rgba(148, 163, 184, 0.4)",
];

const SCALE_TEAL = [
  "rgba(20, 184, 166, 0.92)",
  "rgba(14, 165, 233, 0.82)",
  "rgba(67, 97, 238, 0.72)",
  "rgba(71, 85, 105, 0.55)",
  "rgba(148, 163, 184, 0.4)",
];

const SCALE_SLATE = [
  "rgba(51, 65, 85, 0.9)",
  "rgba(71, 85, 105, 0.78)",
  "rgba(100, 116, 139, 0.65)",
  "rgba(148, 163, 184, 0.5)",
  "rgba(203, 213, 225, 0.7)",
];

const tooltipDefaults = {
  backgroundColor: "rgba(17, 24, 39, 0.94)",
  padding: 12,
  titleFont: { size: 13, weight: "bold" as const },
  bodyFont: { size: 12 },
  cornerRadius: 10,
  displayColors: true,
  boxPadding: 4,
};

function ChartPanel({
  icon,
  title,
  description,
  children,
  className,
  loading,
  accent = "blue",
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  accent?: "blue" | "teal" | "slate" | "cyan";
}) {
  const wash =
    accent === "teal"
      ? "radial-gradient(90% 80% at 0% 0%, rgba(20,184,166,0.08), transparent 55%)"
      : accent === "cyan"
        ? "radial-gradient(90% 80% at 0% 0%, rgba(14,165,233,0.08), transparent 55%)"
        : accent === "slate"
          ? "radial-gradient(90% 80% at 0% 0%, rgba(71,85,105,0.08), transparent 55%)"
          : "radial-gradient(90% 80% at 0% 0%, rgba(67,97,238,0.07), transparent 55%)";

  const iconBg =
    accent === "teal"
      ? "bg-teal-500/10 text-teal-600"
      : accent === "cyan"
        ? "bg-sky-500/10 text-sky-600"
        : accent === "slate"
          ? "bg-slate-500/10 text-slate-600"
          : "bg-primary/10 text-primary";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-80"
        style={{ background: wash }}
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
              iconBg
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-neutral-text tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-neutral-muted mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="relative">
          {children}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-soft border border-neutral-border/60">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-semibold text-neutral-text">
                  Updating…
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RankedBars({
  items,
  loading,
}: {
  items: Array<{ label: string; count: number; hint?: string }>;
  loading?: boolean;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="relative space-y-3">
      {items.map((item, i) => {
        const pct = Math.max(6, Math.round((item.count / max) * 100));
        return (
          <div key={`${item.label}-${i}`} className="group">
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-5 text-[11px] font-semibold tabular-nums text-neutral-muted">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-neutral-text truncate">
                  {item.label}
                </span>
                {item.hint && (
                  <span className="text-[10px] text-neutral-muted shrink-0">
                    {item.hint}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold tabular-nums text-neutral-text shrink-0">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-surface overflow-hidden ml-7">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${SCALE_BLUE[Math.min(i, 4)]} 0%, rgba(56,189,248,0.85) 100%)`,
                }}
              />
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

function SegmentShare({
  items,
  colors,
}: {
  items: Array<{ label: string; count: number }>;
  colors: string[];
}) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return (
    <div className="space-y-4">
      <div className="h-3.5 rounded-full overflow-hidden flex bg-neutral-surface">
        {items.map((item, i) => (
          <div
            key={item.label}
            title={`${item.label}: ${item.count}`}
            className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-500"
            style={{
              width: `${(item.count / total) * 100}%`,
              backgroundColor: colors[i % colors.length],
            }}
          />
        ))}
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm font-medium text-neutral-text truncate capitalize">
                {item.label}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold tabular-nums text-neutral-text">
                {item.count.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-muted ml-1.5 tabular-nums">
                {((item.count / total) * 100).toFixed(0)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsCharts({
  clicksByDate,
  topReferrers,
  clicksByCountry,
  clicksByDevice,
  clicksByBrowser,
  clicksByOs,
  utmSources,
  utmMediums,
  utmCampaigns,
  retentionLabel,
  showCompare,
  loading,
}: {
  clicksByDate: Array<{ date: string; count: number; previous?: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  clicksByCountry: Array<{ country: string; count: number }>;
  clicksByDevice?: Array<{ device: string; count: number }>;
  clicksByBrowser?: Array<{ browser: string; count: number }>;
  clicksByOs?: Array<{ os: string; count: number }>;
  utmSources?: Array<{ source: string; count: number }>;
  utmMediums?: Array<{ medium: string; count: number }>;
  utmCampaigns?: Array<{ campaign: string; count: number }>;
  retentionLabel?: string;
  showCompare?: boolean;
  loading?: boolean;
}) {
  const formattedClicksByDate = useMemo(() => {
    return clicksByDate.map((item) => ({
      ...item,
      label: new Date(item.date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [clicksByDate]);

  const hasPrevious =
    !!showCompare &&
    formattedClicksByDate.some((item) => (item.previous || 0) > 0);

  const sparsePoints = formattedClicksByDate.length > 45;
  const peakIndex = useMemo(() => {
    let max = -1;
    let idx = -1;
    formattedClicksByDate.forEach((d, i) => {
      if (d.count > max) {
        max = d.count;
        idx = i;
      }
    });
    return idx;
  }, [formattedClicksByDate]);

  // Combo: soft bars + primary line with peak emphasis
  const clicksOverTimeData = {
    labels: formattedClicksByDate.map((item) => item.label),
    datasets: [
      {
        type: "bar" as const,
        label: "Daily volume",
        data: formattedClicksByDate.map((item) => item.count),
        backgroundColor: formattedClicksByDate.map((_, i) =>
          i === peakIndex ? "rgba(67, 97, 238, 0.28)" : "rgba(67, 97, 238, 0.1)"
        ),
        hoverBackgroundColor: "rgba(67, 97, 238, 0.35)",
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.72,
        order: 2,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "This period",
        data: formattedClicksByDate.map((item) => item.count),
        borderColor: PALETTE.primary,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(67, 97, 238, 0.06)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(67, 97, 238, 0.18)");
          gradient.addColorStop(1, "rgba(67, 97, 238, 0.01)");
          return gradient;
        },
        fill: !hasPrevious,
        tension: 0.4,
        pointRadius: formattedClicksByDate.map((_, i) =>
          sparsePoints ? (i === peakIndex ? 5 : 0) : i === peakIndex ? 6 : 3
        ),
        pointHoverRadius: 7,
        pointBackgroundColor: formattedClicksByDate.map((_, i) =>
          i === peakIndex ? PALETTE.cyan : PALETTE.primary
        ),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 2.75,
        order: 1,
        yAxisID: "y",
      },
      ...(hasPrevious
        ? [
            {
              type: "line" as const,
              label: "Previous period",
              data: formattedClicksByDate.map((item) => item.previous || 0),
              borderColor: "rgba(100, 116, 139, 0.55)",
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              borderDash: [5, 5],
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
              order: 0,
              yAxisID: "y",
            },
          ]
        : []),
    ],
  };

  const clicksOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: loading ? 0 : 450 },
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: "circle" as const,
          font: { size: 11 },
          color: "#6B7280",
          filter: (item: { text: string }) => item.text !== "Daily volume",
        },
      },
      tooltip: {
        ...tooltipDefaults,
        filter: (item: { dataset: { label?: string } }) =>
          item.dataset.label !== "Daily volume",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(17, 24, 39, 0.05)", drawBorder: false },
        ticks: {
          precision: 0,
          font: { size: 11 },
          color: "#6B7280",
          callback: (value: any) => (Number.isInteger(value) ? value : ""),
        },
        border: { display: false },
      },
    },
  };

  const countriesBarData = {
    labels: clicksByCountry.map((item) => item.country),
    datasets: [
      {
        label: "Clicks",
        data: clicksByCountry.map((item) => item.count),
        backgroundColor: clicksByCountry.map((_, i) => SCALE_TEAL[i % SCALE_TEAL.length]),
        hoverBackgroundColor: clicksByCountry.map(
          (_, i) => SCALE_TEAL[i % SCALE_TEAL.length]
        ),
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 16,
      },
    ],
  };

  const countriesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: loading ? 0 : 450 },
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: tooltipDefaults,
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(17, 24, 39, 0.05)" },
        ticks: { font: { size: 11 }, color: "#6B7280", precision: 0 },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: "#374151", fontStyle: "bold" as const },
        border: { display: false },
      },
    },
  };

  const browsersBarData = {
    labels: (clicksByBrowser || []).map((d) => d.browser),
    datasets: [
      {
        label: "Clicks",
        data: (clicksByBrowser || []).map((d) => d.count),
        backgroundColor: (clicksByBrowser || []).map(
          (_, i) => SCALE_BLUE[i % SCALE_BLUE.length]
        ),
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  };

  const browsersBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: loading ? 0 : 450 },
    plugins: {
      legend: { display: false },
      tooltip: tooltipDefaults,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#6B7280", maxRotation: 0 },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(17, 24, 39, 0.05)" },
        ticks: { precision: 0, font: { size: 11 }, color: "#6B7280" },
        border: { display: false },
      },
    },
  };

  const hasDevices =
    (clicksByDevice && clicksByDevice.length > 0) ||
    (clicksByBrowser && clicksByBrowser.length > 0) ||
    (clicksByOs && clicksByOs.length > 0);

  const hasUtm =
    (utmSources && utmSources.length > 0) ||
    (utmMediums && utmMediums.length > 0) ||
    (utmCampaigns && utmCampaigns.length > 0);

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: loading ? 0 : 450 },
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 12,
          font: { size: 11 },
          usePointStyle: true,
          pointStyle: "circle" as const,
          color: "#6B7280",
        },
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className={cn(
        "space-y-5 mb-2 transition-[filter,opacity] duration-200",
        loading && "pointer-events-none"
      )}
    >
      {clicksByDate.length > 0 && (
        <ChartPanel
          icon={<TrendingUp className="h-5 w-5" />}
          title="Clicks over time"
          description={retentionLabel || "Activity in your analytics window"}
          loading={loading}
          accent="blue"
        >
          <div className="h-72 sm:h-80">
            <Bar data={clicksOverTimeData as any} options={clicksOverTimeOptions as any} />
          </div>
        </ChartPanel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {topReferrers.length > 0 && (
          <ChartPanel
            icon={<Globe className="h-5 w-5" />}
            title="Top referrers"
            description="Where traffic is coming from"
            loading={loading}
            accent="cyan"
          >
            <RankedBars
              items={topReferrers.slice(0, 8).map((r) => ({
                label: r.referrer,
                count: r.count,
              }))}
            />
          </ChartPanel>
        )}

        {clicksByCountry.length > 0 && (
          <ChartPanel
            icon={<MapPin className="h-5 w-5" />}
            title="Clicks by country"
            description="Geographic distribution"
            loading={loading}
            accent="teal"
          >
            <div className="h-64">
              <Bar data={countriesBarData} options={countriesBarOptions as any} />
            </div>
          </ChartPanel>
        )}
      </div>

      {hasDevices && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {clicksByDevice && clicksByDevice.length > 0 && (
            <ChartPanel
              icon={<Smartphone className="h-5 w-5" />}
              title="Devices"
              description="Desktop, mobile, tablet"
              loading={loading}
              accent="blue"
            >
              <SegmentShare
                items={clicksByDevice.map((d) => ({
                  label: d.device,
                  count: d.count,
                }))}
                colors={SCALE_BLUE}
              />
            </ChartPanel>
          )}
          {clicksByBrowser && clicksByBrowser.length > 0 && (
            <ChartPanel
              icon={<Monitor className="h-5 w-5" />}
              title="Browsers"
              description="Client software mix"
              loading={loading}
              accent="cyan"
            >
              <div className="h-52">
                <Bar data={browsersBarData} options={browsersBarOptions as any} />
              </div>
            </ChartPanel>
          )}
          {clicksByOs && clicksByOs.length > 0 && (
            <ChartPanel
              icon={<Laptop className="h-5 w-5" />}
              title="Operating systems"
              description="Platform breakdown"
              loading={loading}
              accent="slate"
            >
              <SegmentShare
                items={clicksByOs.map((d) => ({ label: d.os, count: d.count }))}
                colors={SCALE_SLATE}
              />
            </ChartPanel>
          )}
        </div>
      )}

      {hasUtm && (
        <ChartPanel
          icon={<Target className="h-5 w-5" />}
          title="UTM tracking"
          description="Campaign attribution across all links"
          loading={loading}
          accent="teal"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {utmSources && utmSources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-3.5 w-3.5 text-neutral-muted" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                    Source
                  </h4>
                </div>
                <RankedBars
                  items={utmSources.slice(0, 5).map((s) => ({
                    label: s.source,
                    count: s.count,
                  }))}
                />
              </div>
            )}

            {utmMediums && utmMediums.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-3.5 w-3.5 text-neutral-muted" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                    Medium
                  </h4>
                </div>
                <div className="h-48">
                  <Doughnut
                    data={{
                      labels: utmMediums.slice(0, 5).map((item) => item.medium),
                      datasets: [
                        {
                          data: utmMediums.slice(0, 5).map((item) => item.count),
                          backgroundColor: SCALE_TEAL,
                          borderColor: "#fff",
                          borderWidth: 3,
                          hoverOffset: 6,
                        },
                      ],
                    }}
                    options={doughnutOpts as any}
                  />
                </div>
              </div>
            )}

            {utmCampaigns && utmCampaigns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-3.5 w-3.5 text-neutral-muted" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                    Campaign
                  </h4>
                </div>
                <div className="h-48">
                  <Bar
                    data={{
                      labels: utmCampaigns.slice(0, 5).map((item) =>
                        item.campaign.length > 12
                          ? item.campaign.substring(0, 12) + "…"
                          : item.campaign
                      ),
                      datasets: [
                        {
                          label: "Clicks",
                          data: utmCampaigns.slice(0, 5).map((item) => item.count),
                          backgroundColor: utmCampaigns
                            .slice(0, 5)
                            .map((_, i) => SCALE_BLUE[i % SCALE_BLUE.length]),
                          borderRadius: 10,
                          borderSkipped: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: { duration: loading ? 0 : 450 },
                      plugins: {
                        legend: { display: false },
                        tooltip: tooltipDefaults,
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 }, color: "#6B7280" },
                          border: { display: false },
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: "rgba(17, 24, 39, 0.05)" },
                          ticks: {
                            precision: 0,
                            font: { size: 11 },
                            color: "#6B7280",
                          },
                          border: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </ChartPanel>
      )}
    </div>
  );
}
