import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "primary";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-surface text-neutral-muted border-neutral-border",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
  primary: "bg-primary/10 text-primary border-primary/15",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full",
        "text-xs font-semibold border",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
