import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6 rounded-card bg-white border border-neutral-border/80 shadow-soft",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-5 w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-text tracking-tight mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-muted max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
