import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "solid" | "outline" | "ghost" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Soft pill shape for primary CTAs */
  pill?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-primary text-white hover:bg-bright-indigo shadow-button hover:shadow-hover disabled:bg-neutral-border disabled:text-neutral-muted disabled:shadow-none",
  outline:
    "bg-white text-neutral-text border border-neutral-border shadow-soft hover:border-primary/30 hover:text-primary disabled:opacity-50",
  ghost:
    "bg-transparent text-neutral-muted hover:bg-white/80 hover:text-neutral-text hover:shadow-soft disabled:opacity-50",
  accent:
    "bg-neutral-text text-white hover:bg-neutral-text/90 shadow-soft disabled:bg-neutral-border disabled:text-neutral-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
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
          "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200",
          "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:active:scale-100",
          pill ? "rounded-full" : "rounded-2xl",
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
