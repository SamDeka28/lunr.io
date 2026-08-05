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
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-text tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm sm:text-[15px] text-neutral-muted leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto [&>a]:w-full sm:[&>a]:w-auto [&>button]:w-full sm:[&_button]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
