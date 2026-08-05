import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  /** Optional trend chip, e.g. "+12%" */
  trend?: string;
  trendPositive?: boolean;
  accent?: "default" | "primary";
}

export function StatCard({
  className,
  label,
  value,
  icon,
  hint,
  trend,
  trendPositive = true,
  accent = "default",
  ...props
}: StatCardProps) {
  return (
    <Card
      hoverLift
      className={cn(
        "relative overflow-hidden",
        accent === "primary" && "ring-1 ring-primary/10",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
        style={{
          background:
            accent === "primary"
              ? "radial-gradient(120% 80% at 100% 0%, rgba(67,97,238,0.12), transparent 60%)"
              : "radial-gradient(120% 80% at 100% 0%, rgba(67,97,238,0.06), transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="text-[13px] font-medium text-neutral-muted">{label}</div>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trendPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              )}
            >
              {trend}
            </span>
          )}
          {icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center",
                accent === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-neutral-surface text-neutral-muted"
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
      <div className="relative text-3xl sm:text-[2rem] font-semibold text-neutral-text tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="relative mt-3 text-sm text-neutral-muted">{hint}</div>}
    </Card>
  );
}
