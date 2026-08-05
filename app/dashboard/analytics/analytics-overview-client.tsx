"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Download,
  FileText,
  Link2,
  Loader2,
  QrCode,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { OverviewResult } from "@/lib/services/overview-analytics.service";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { AnalyticsChartsLazy } from "./analytics-charts-lazy";

type RangePreset = "7d" | "30d" | "90d" | "custom";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}

function rangeForPreset(
  preset: RangePreset,
  retentionDays: number
): { from: string; to: string } {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const maxSpan = retentionDays < 0 ? 3650 : retentionDays;
  const span =
    preset === "7d" ? 7 : preset === "90d" ? 90 : preset === "30d" ? 30 : 30;
  const days = Math.min(span, maxSpan);
  return { from: toDateKey(addDays(to, -(days - 1))), to: toDateKey(to) };
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct == null) {
    return (
      <span className="text-[11px] font-medium text-neutral-muted">vs prior</span>
    );
  }
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
        up ? "text-emerald-600" : "text-rose-600"
      )}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

function activityIcon(type: OverviewResult["recentActivity"][number]["type"]) {
  switch (type) {
    case "qr":
      return <QrCode className="h-3.5 w-3.5" />;
    case "page_view":
    case "page_click":
      return <FileText className="h-3.5 w-3.5" />;
    default:
      return <Link2 className="h-3.5 w-3.5" />;
  }
}

function activityLabel(type: OverviewResult["recentActivity"][number]["type"]) {
  switch (type) {
    case "qr":
      return "QR scan";
    case "page_view":
      return "Page view";
    case "page_click":
      return "Page click";
    default:
      return "Link click";
  }
}

export function AnalyticsOverviewClient({
  retentionDays,
}: {
  retentionDays: number;
}) {
  const initial = rangeForPreset("30d", retentionDays);
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [source, setSource] = useState<"all" | "links" | "qr" | "pages">("all");
  const [campaignId, setCampaignId] = useState("");
  const [tag, setTag] = useState("");
  const [folder, setFolder] = useState("");
  const [linkId, setLinkId] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [compare, setCompare] = useState(true);
  const [includeBots, setIncludeBots] = useState(false);
  const [data, setData] = useState<OverviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertMultiplier, setAlertMultiplier] = useState(2);
  const [savingAlert, setSavingAlert] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("from", from);
    params.set("to", to);
    params.set("source", source);
    params.set("compare", compare ? "1" : "0");
    if (campaignId) params.set("campaignId", campaignId);
    if (tag) params.set("tag", tag);
    if (folder) params.set("folder", folder);
    if (linkId) params.set("linkId", linkId);
    if (country) params.set("country", country);
    if (device) params.set("device", device);
    if (includeBots) params.set("bots", "1");
    return params.toString();
  }, [
    from,
    to,
    source,
    compare,
    campaignId,
    tag,
    folder,
    linkId,
    country,
    device,
    includeBots,
  ]);

  useLayoutEffect(() => {
    // Flip loading before paint so filters feel instant
    setLoading(true);
  }, [queryString]);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/analytics/overview?${queryString}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load analytics");
        }
        const json = (await res.json()) as OverviewResult;
        if (controller.signal.aborted) return;
        setData(json);
        if (json.alert) {
          setAlertEnabled(json.alert.enabled);
          setAlertMultiplier(json.alert.multiplier);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [queryString]);

  const reload = () => {
    setLoading(true);
    fetch(`/api/analytics/overview?${queryString}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to reload");
        return res.json() as Promise<OverviewResult>;
      })
      .then((json) => {
        setData(json);
        if (json.alert) {
          setAlertEnabled(json.alert.enabled);
          setAlertMultiplier(json.alert.multiplier);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const applyPreset = (p: RangePreset) => {
    setPreset(p);
    if (p === "custom") return;
    const r = rangeForPreset(p, retentionDays);
    setFrom(r.from);
    setTo(r.to);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch(`/api/analytics/export?${queryString}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const saveAlertSettings = async () => {
    try {
      setSavingAlert(true);
      const res = await fetch("/api/analytics/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: alertEnabled,
          spike_multiplier: alertMultiplier,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save alert settings");
      }
      toast.success("Alert settings saved");
      reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingAlert(false);
    }
  };

  const retentionLabel =
    retentionDays < 0 ? "Unlimited history" : `Last ${retentionDays} days`;

  const summary = data?.summary;
  const filters = data?.filterOptions;
  const maxLinkClicks = Math.max(...(data?.topLinks.map((l) => l.clicks) || [0]), 1);
  const hasAnyData =
    (summary?.clicks || 0) > 0 ||
    (summary?.pageViews || 0) > 0 ||
    (data?.topLinks.length || 0) > 0;

  return (
    <DashboardContainer size="wide">
      <PageHeader
        title="Analytics"
        description="Links, QR scans, and pages in one place"
        actions={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant="primary">{retentionLabel}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting || loading}
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        }
      />

      {/* Controls */}
      <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d", "custom"] as RangePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPreset(p)}
              className={cn(
                "h-9 px-3.5 rounded-full text-sm font-semibold transition-colors",
                preset === p
                  ? "bg-primary text-white shadow-button"
                  : "bg-neutral-surface text-neutral-muted hover:text-neutral-text"
              )}
            >
              {p === "custom" ? "Custom" : p.replace("d", " days")}
            </button>
          ))}

          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {(
              [
                ["all", "All"],
                ["links", "Links"],
                ["qr", "QR"],
                ["pages", "Pages"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSource(value)}
                className={cn(
                  "h-9 px-3 rounded-full text-xs font-semibold transition-colors",
                  source === value
                    ? "bg-neutral-text text-white"
                    : "bg-white border border-neutral-border text-neutral-muted hover:text-neutral-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium text-neutral-muted flex items-center gap-2">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 px-3 rounded-xl border border-neutral-border text-sm"
              />
            </label>
            <label className="text-xs font-medium text-neutral-muted flex items-center gap-2">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 px-3 rounded-xl border border-neutral-border text-sm"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-neutral-text cursor-pointer">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => setCompare(e.target.checked)}
              className="rounded border-neutral-border text-primary focus:ring-primary/30"
            />
            Compare to previous period
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-muted cursor-pointer">
            <input
              type="checkbox"
              checked={includeBots}
              onChange={(e) => setIncludeBots(e.target.checked)}
              className="rounded border-neutral-border text-primary focus:ring-primary/30"
            />
            Include bots
          </label>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="ml-auto text-xs font-semibold text-primary hover:text-bright-indigo"
          >
            {showFilters ? "Hide filters" : "More filters"}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
            <Select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All campaigns</option>
              {filters?.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All tags</option>
              {filters?.tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All folders</option>
              {filters?.folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
            <Select
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All links</option>
              {filters?.links.map((l) => (
                <option key={l.id} value={l.id}>
                  /{l.short_code}
                </option>
              ))}
            </Select>
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All countries</option>
              {filters?.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="">All devices</option>
              {filters?.devices.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {data?.hasOlderData && retentionDays >= 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3.5 text-sm text-amber-950 shadow-soft">
          Charts respect your {retentionDays}-day plan window.{" "}
          <Link
            href="/dashboard/billing"
            className="font-semibold text-amber-900 underline underline-offset-2 hover:no-underline"
          >
            Upgrade for longer history
          </Link>
        </div>
      )}

      {data?.alert?.triggered && data.alert.message && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm text-neutral-text shadow-soft flex items-start gap-3">
          <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-neutral-text">{data.alert.message}</p>
            <p className="text-xs text-neutral-muted mt-0.5">
              Spike alerts can also fire the <code className="text-[11px]">analytics.spike</code>{" "}
              webhook.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {/* Stats */}
      <div
        className={cn(
          "relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-opacity",
          loading && "opacity-55"
        )}
      >
        {loading && data && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 shadow-soft border border-neutral-border/70">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs font-semibold text-neutral-text">Updating…</span>
            </div>
          </div>
        )}
        <StatCard
          label={source === "pages" ? "Page views" : "Clicks"}
          value={(summary?.clicks || 0).toLocaleString()}
          icon={<Activity className="h-4 w-4" />}
          accent="primary"
          hint={
            compare ? (
              <ChangeBadge pct={summary?.clicksChangePct ?? null} />
            ) : undefined
          }
        />
        <StatCard
          label="Unique"
          value={(summary?.uniqueClicks || 0).toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          hint="Distinct IPs per day"
        />
        <StatCard
          label="QR scans"
          value={(summary?.qrScans || 0).toLocaleString()}
          icon={<QrCode className="h-4 w-4" />}
          hint={
            compare ? (
              <ChangeBadge
                pct={
                  summary
                    ? summary.prevQrScans === 0
                      ? summary.qrScans === 0
                        ? 0
                        : null
                      : Math.round(
                          ((summary.qrScans - summary.prevQrScans) /
                            summary.prevQrScans) *
                            1000
                        ) / 10
                    : null
                }
              />
            ) : undefined
          }
        />
        <StatCard
          label="Page views"
          value={(summary?.pageViews || 0).toLocaleString()}
          icon={<FileText className="h-4 w-4" />}
          hint={`${(summary?.pageClicks || 0).toLocaleString()} page clicks`}
        />
      </div>

      {data && hasAnyData ? (
        <>
          <AnalyticsChartsLazy
            clicksByDate={data.clicksByDate}
            topReferrers={data.topReferrers}
            clicksByCountry={data.clicksByCountry}
            clicksByDevice={data.clicksByDevice}
            clicksByBrowser={data.clicksByBrowser}
            clicksByOs={data.clicksByOs}
            utmSources={data.utmSources}
            utmMediums={data.utmMediums}
            utmCampaigns={data.utmCampaigns}
            retentionLabel={`${data.range.from} → ${data.range.to}${
              compare
                ? ` · vs ${data.previousRange.from} → ${data.previousRange.to}`
                : ""
            }`}
            showCompare={compare}
            loading={loading}
          />

          <div
            className={cn(
              "relative grid grid-cols-1 xl:grid-cols-5 gap-5 transition-opacity",
              loading && "opacity-55"
            )}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-16 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 shadow-soft border border-neutral-border/70">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs font-semibold text-neutral-text">
                    Updating…
                  </span>
                </div>
              </div>
            )}
            {/* Top links */}
            <div className="xl:col-span-3 relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft">
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-neutral-text tracking-tight">
                        Top links
                      </h2>
                      <p className="text-xs text-neutral-muted mt-0.5">
                        Ranked by clicks in this range
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/links"
                    className="text-xs font-semibold text-primary hover:text-bright-indigo inline-flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {data.topLinks.length === 0 ? (
                  <p className="text-sm text-neutral-muted py-6 text-center">
                    No link clicks in this range
                  </p>
                ) : (
                  <div className="divide-y divide-neutral-border/70">
                    {data.topLinks.map((link, index) => {
                      const pct = Math.max(
                        4,
                        Math.round((link.clicks / maxLinkClicks) * 100)
                      );
                      const displayTitle =
                        link.title ||
                        (() => {
                          try {
                            return new URL(link.original_url).hostname.replace(
                              /^www\./,
                              ""
                            );
                          } catch {
                            return "Untitled";
                          }
                        })();
                      return (
                        <Link
                          key={link.id}
                          href={`/dashboard/links/${link.id}/analytics`}
                          className="flex items-center gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0 group"
                        >
                          <span className="w-7 h-7 rounded-xl bg-neutral-surface text-neutral-muted text-xs font-semibold tabular-nums flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-sm font-semibold text-primary truncate mb-1">
                              /{link.short_code}
                            </div>
                            <div className="text-xs text-neutral-muted truncate mb-2">
                              {displayTitle}
                            </div>
                            <div className="h-1.5 rounded-full bg-neutral-surface overflow-hidden max-w-md">
                              <div
                                className="h-full rounded-full bg-primary/80"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <div className="text-lg font-semibold text-neutral-text tabular-nums tracking-tight">
                              {link.clicks.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-neutral-muted">
                              clicks
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {data.topPages.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-neutral-border/70">
                    <h3 className="text-sm font-semibold text-neutral-text mb-3">
                      Top pages
                    </h3>
                    <div className="space-y-2">
                      {data.topPages.map((page) => (
                        <Link
                          key={page.id}
                          href={`/dashboard/pages/${page.id}/analytics`}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-neutral-surface/80 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-neutral-text truncate">
                              {page.title || `/${page.slug}`}
                            </div>
                            <div className="text-xs text-neutral-muted font-mono truncate">
                              /{page.slug}
                            </div>
                          </div>
                          <div className="text-right text-xs text-neutral-muted shrink-0">
                            <span className="font-semibold text-neutral-text tabular-nums">
                              {page.views.toLocaleString()}
                            </span>{" "}
                            views ·{" "}
                            <span className="tabular-nums">
                              {page.clicks.toLocaleString()}
                            </span>{" "}
                            clicks
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent + alerts */}
            <div className="xl:col-span-2 space-y-5">
              <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-neutral-text tracking-tight">
                      Recent activity
                    </h2>
                    <p className="text-xs text-neutral-muted mt-0.5">
                      Latest clicks, scans, and views
                    </p>
                  </div>
                </div>
                {data.recentActivity.length === 0 ? (
                  <p className="text-sm text-neutral-muted text-center py-8">
                    Nothing in this range yet
                  </p>
                ) : (
                  <ul className="space-y-1 max-h-[28rem] overflow-y-auto -mx-1 px-1">
                    {data.recentActivity.map((item) => {
                      const inner = (
                        <div className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-neutral-surface/70 transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-neutral-surface text-neutral-muted flex items-center justify-center shrink-0 mt-0.5">
                            {activityIcon(item.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-neutral-text truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide text-neutral-muted font-medium shrink-0">
                                {activityLabel(item.type)}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-muted mt-0.5 truncate">
                              {[item.country, item.device, item.referrer]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </div>
                          </div>
                          <time className="text-[11px] text-neutral-muted tabular-nums shrink-0">
                            {new Date(item.at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                      );
                      return (
                        <li key={item.id}>
                          {item.href ? (
                            <Link href={item.href}>{inner}</Link>
                          ) : (
                            inner
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-neutral-text tracking-tight">
                      Spike alerts
                    </h2>
                    <p className="text-xs text-neutral-muted mt-0.5">
                      Notify when today exceeds your baseline
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-neutral-text font-medium">Enabled</span>
                    <input
                      type="checkbox"
                      checked={alertEnabled}
                      onChange={(e) => setAlertEnabled(e.target.checked)}
                      className="rounded border-neutral-border text-primary focus:ring-primary/30"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-neutral-muted text-xs font-medium">
                      Multiplier vs 7-day average
                    </span>
                    <input
                      type="number"
                      min={1.2}
                      max={10}
                      step={0.1}
                      value={alertMultiplier}
                      onChange={(e) =>
                        setAlertMultiplier(Number(e.target.value) || 2)
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-neutral-border text-sm"
                    />
                  </label>
                  {data.alert && (
                    <p className="text-[11px] text-neutral-muted">
                      Today: {data.alert.todayClicks} · baseline ≈{" "}
                      {data.alert.baselineAvg}/day
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveAlertSettings}
                    disabled={savingAlert}
                    className="w-full"
                  >
                    {savingAlert ? "Saving…" : "Save alert settings"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !loading && data ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="No analytics in this range"
          description="Try a wider date range, clear filters, or create and share a short link."
          action={
            <Link href="/dashboard/links/new">
              <Button>
                <Link2 className="h-4 w-4" />
                Create a link
              </Button>
            </Link>
          }
        />
      ) : loading && !data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-card bg-white border border-neutral-border/80 shadow-soft animate-pulse"
              />
            ))}
          </div>
          <div className="h-80 rounded-card bg-white border border-neutral-border/80 shadow-soft animate-pulse" />
        </div>
      ) : null}
    </DashboardContainer>
  );
}
