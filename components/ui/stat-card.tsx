import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  /** Subtle accent tint — use sparingly */
  accent?: "default" | "primary";
}

export function StatCard({
  className,
  label,
  value,
  icon,
  hint,
  accent = "default",
  ...props
}: StatCardProps) {
  return (
    <Card
      hoverLift
      className={cn(
        "group",
        accent === "primary" && "border-primary/15",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center",
              accent === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-neutral-surface text-neutral-muted"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold text-neutral-text tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-neutral-muted">{label}</div>
      {hint && <div className="mt-3 text-xs text-neutral-muted">{hint}</div>}
    </Card>
  );
}
