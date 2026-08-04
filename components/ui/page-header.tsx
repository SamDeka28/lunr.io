import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  className,
  title,
  description,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-text tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base text-neutral-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
