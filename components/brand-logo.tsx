"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  /** full wordmark, or icon-only mark */
  variant?: "full" | "mark";
  /** compact | default | large */
  size?: "sm" | "md" | "lg";
  /** Use on dark backgrounds — light wordmark asset */
  onDark?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
  /** Optional subtitle under the mark when variant is mark */
  subtitle?: string;
  showWordmark?: boolean;
};

const SIZE = {
  sm: { fullH: 28, mark: 28 },
  md: { fullH: 36, mark: 36 },
  lg: { fullH: 44, mark: 48 },
} as const;

const FULL_RATIO = 838 / 240;
const DARK_FULL_RATIO = 764 / 182;

export function BrandLogo({
  variant = "full",
  size = "md",
  onDark = false,
  href = "/",
  className,
  priority = false,
  subtitle,
  showWordmark = false,
}: BrandLogoProps) {
  const dims = SIZE[size];

  const content =
    variant === "mark" ? (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <span
          className="relative shrink-0 overflow-hidden"
          style={{ width: dims.mark, height: dims.mark }}
        >
          <Image
            src="/lunr-mark.png"
            alt="lunr.to"
            width={dims.mark}
            height={dims.mark}
            className="h-full w-auto object-contain"
            priority={priority}
          />
        </span>
        {(showWordmark || subtitle) && (
          <span className="flex flex-col leading-tight min-w-0">
            <span
              className={cn(
                "font-bold tracking-tight",
                size === "sm" && "text-sm",
                size === "md" && "text-base",
                size === "lg" && "text-xl",
                onDark ? "text-white" : "text-neutral-text"
              )}
            >
              lunr.to
            </span>
            {subtitle ? (
              <span
                className={cn(
                  "text-xs truncate",
                  onDark ? "text-white/70" : "text-neutral-muted"
                )}
              >
                {subtitle}
              </span>
            ) : null}
          </span>
        )}
      </span>
    ) : (
      <span
        className={cn("inline-flex items-center", className)}
        style={{ height: dims.fullH }}
      >
        <Image
          src={onDark ? "/lunr-logo-dark.png" : "/lunr-logo.png"}
          alt="lunr.to"
          width={Math.round(
            dims.fullH * (onDark ? DARK_FULL_RATIO : FULL_RATIO)
          )}
          height={dims.fullH}
          className="h-full w-auto object-contain"
          priority={priority}
        />
      </span>
    );

  if (href === null) return content;

  return (
    <Link href={href} className="inline-flex items-center shrink-0">
      {content}
    </Link>
  );
}
