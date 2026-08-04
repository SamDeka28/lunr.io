import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pill shape (rounded-full) — Airbnb-style default for primary CTAs */
  pill?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-primary text-white hover:bg-primary-dark shadow-button disabled:bg-neutral-border disabled:text-neutral-muted disabled:shadow-none",
  outline:
    "bg-white text-neutral-text border border-neutral-border hover:border-neutral-text/30 hover:bg-neutral-surface disabled:opacity-50",
  ghost:
    "bg-transparent text-neutral-text hover:bg-neutral-surface disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "solid",
      size = "md",
      pill = true,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-150",
          "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:active:scale-100",
          pill ? "rounded-full" : "rounded-xl",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
