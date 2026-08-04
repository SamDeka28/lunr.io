import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[96px] px-4 py-3 rounded-xl border border-neutral-border bg-white",
          "text-sm font-medium text-neutral-text placeholder:text-neutral-muted",
          "transition-colors duration-150 resize-y",
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
Textarea.displayName = "Textarea";
