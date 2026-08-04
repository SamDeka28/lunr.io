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
        "py-16 px-6 rounded-2xl bg-white border border-neutral-border shadow-soft",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-5 w-16 h-16 rounded-2xl bg-neutral-surface flex items-center justify-center text-neutral-muted">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-text tracking-tight mb-2">
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
