import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type DashboardContainerSize = "narrow" | "default" | "wide";

const sizeClasses: Record<DashboardContainerSize, string> = {
  /** Forms, focused edit flows */
  narrow: "max-w-3xl",
  /** Lists, home, settings, billing, overview analytics */
  default: "max-w-6xl",
  /** Dense analytics / multi-column charts */
  wide: "max-w-7xl",
};

export interface DashboardContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: DashboardContainerSize;
  /** Vertical rhythm between major page sections */
  gap?: boolean;
}

/**
 * Standard content width + spacing for dashboard pages.
 * Pair with PageHeader as the first child.
 */
export function DashboardContainer({
  className,
  size = "default",
  gap = true,
  children,
  ...props
}: DashboardContainerProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "mx-auto w-full",
        gap && "space-y-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
