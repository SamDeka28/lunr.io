import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full h-11 px-4 rounded-xl border border-neutral-border bg-white",
          "text-sm font-medium text-neutral-text placeholder:text-neutral-muted",
          "transition-colors duration-150",
          "hover:border-neutral-text/25",
          "focus:outline-none focus:border-neutral-text/40 focus:ring-2 focus:ring-neutral-text/5",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-surface",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
