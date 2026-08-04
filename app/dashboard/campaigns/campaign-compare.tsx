"use client";

import { useEffect, useState } from "react";
import { GitCompare, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampaignWithStats } from "@/types/database.types";
import { computeCpc } from "@/lib/utils/utm";

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function MetricRow({
  label,
  a,
  b,
  format = formatNum,
  higherIsBetter = true,
}: {
  label: string;
  a: number | null;
  b: number | null;
  format?: (n: number) => string;
  higherIsBetter?: boolean;
}) {
  const aVal = a ?? 0;
  const bVal = b ?? 0;
  const aWins =
    a != null && b != null && a !== b
      ? higherIsBetter
        ? aVal > bVal
        : aVal < bVal
      : false;
  const bWins =
    a != null && b != null && a !== b
      ? higherIsBetter
        ? bVal > aVal
        : bVal < aVal
      : false;

  return (
    <div className="grid grid-cols-3 gap-3 py-3 border-b border-neutral-border last:border-0 items-center">
      <div
        className={`text-right text-base font-semibold tabular-nums ${
          aWins ? "text-primary" : "text-neutral-text"
        }`}
      >
        {a == null ? "—" : format(a)}
      </div>
      <div className="text-center text-xs font-medium text-neutral-muted uppercase tracking-wide">
        {label}
      </div>
      <div
        className={`text-left text-base font-semibold tabular-nums ${
          bWins ? "text-primary" : "text-neutral-text"
        }`}
      >
        {b == null ? "—" : format(b)}
      </div>
    </div>
  );
}

export function CampaignCompare({
  campaignIds,
  onClose,
}: {
  campaignIds: [string, string];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [a, setA] = useState<CampaignWithStats | null>(null);
  const [b, setB] = useState<CampaignWithStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [resA, resB] = await Promise.all([
          fetch(`/api/campaigns/${campaignIds[0]}`),
          fetch(`/api/campaigns/${campaignIds[1]}`),
        ]);
        if (!resA.ok || !resB.ok) {
          throw new Error("Failed to load campaign stats");
        }
        const dataA = await resA.json();
        const dataB = await resB.json();
        if (!cancelled) {
          setA(dataA);
          setB(dataB);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to compare");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [campaignIds[0], campaignIds[1]]);

  const cpcA = a ? computeCpc(Number(a.budget) || 0, a.total_clicks) : null;
  const cpcB = b ? computeCpc(Number(b.budget) || 0, b.total_clicks) : null;
  const uniqueRateA =
    a && a.total_clicks > 0 ? (a.unique_clicks / a.total_clicks) * 100 : null;
  const uniqueRateB =
    b && b.total_clicks > 0 ? (b.unique_clicks / b.total_clicks) * 100 : null;
  const clicksPerLinkA =
    a && a.total_links > 0 ? a.total_clicks / a.total_links : null;
  const clicksPerLinkB =
    b && b.total_links > 0 ? b.total_clicks / b.total_links : null;

  return (
    <Card className="mb-6" padding="lg">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-surface flex items-center justify-center text-neutral-muted">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-text">
              Campaign comparison
            </h3>
            <p className="text-sm text-neutral-muted">
              Side-by-side clicks, uniqueness, and efficiency
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" pill onClick={onClose} aria-label="Close compare">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-neutral-muted">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading stats…
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 py-4 text-center">{error}</p>
      )}

      {!loading && !error && a && b && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-2 items-end">
            <div className="text-right">
              <p className="text-base font-semibold text-neutral-text truncate">
                {a.name}
              </p>
              <Badge variant="default" className="mt-1">
                A
              </Badge>
            </div>
            <div className="text-center text-xs text-neutral-muted">vs</div>
            <div className="text-left">
              <p className="text-base font-semibold text-neutral-text truncate">
                {b.name}
              </p>
              <Badge variant="default" className="mt-1">
                B
              </Badge>
            </div>
          </div>

          <MetricRow label="Links" a={a.total_links} b={b.total_links} />
          <MetricRow label="Clicks" a={a.total_clicks} b={b.total_clicks} />
          <MetricRow label="Unique" a={a.unique_clicks} b={b.unique_clicks} />
          <MetricRow
            label="Unique %"
            a={uniqueRateA}
            b={uniqueRateB}
            format={(n) => `${n.toFixed(1)}%`}
          />
          <MetricRow
            label="Clicks / link"
            a={clicksPerLinkA}
            b={clicksPerLinkB}
            format={(n) => n.toFixed(1)}
          />
          <MetricRow
            label="CPC"
            a={cpcA}
            b={cpcB}
            format={(n) => `$${n.toFixed(2)}`}
            higherIsBetter={false}
          />
          <MetricRow
            label="Target %"
            a={
              a.target_clicks > 0
                ? Math.min((a.total_clicks / a.target_clicks) * 100, 100)
                : null
            }
            b={
              b.target_clicks > 0
                ? Math.min((b.total_clicks / b.target_clicks) * 100, 100)
                : null
            }
            format={(n) => `${Math.round(n)}%`}
          />
        </>
      )}
    </Card>
  );
}
