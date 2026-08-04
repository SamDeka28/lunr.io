"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { AnalyticsCharts } from "./analytics-charts";

// The chart bundle (chart.js + react-chartjs-2) is sizable and only needed on
// the Analytics tab. Load it lazily on the client so it doesn't block the first
// paint of the page; a skeleton is shown while it downloads.
const AnalyticsChartsInner = dynamic(
  () => import("./analytics-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="h-5 w-40 bg-neutral-border rounded-lg animate-pulse mb-6" />
            <div className="h-64 w-full bg-neutral-border/60 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    ),
  }
);

export function AnalyticsChartsLazy(props: ComponentProps<typeof AnalyticsCharts>) {
  return <AnalyticsChartsInner {...props} />;
}
