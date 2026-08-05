"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InfoTooltipProps {
  text: string;
  className?: string;
  /** Accessible name for the icon button */
  label?: string;
}

/**
 * Hover/focus tip for jargon terms. Portaled + fixed so it isn’t clipped
 * by overflow-hidden parents (e.g. table cards).
 */
export function InfoTooltip({
  text,
  className,
  label = "More information",
}: InfoTooltipProps) {
  const tipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipWidth = 256;
    const padding = 8;
    let left = rect.left + rect.width / 2;
    left = Math.max(tipWidth / 2 + padding, Math.min(left, window.innerWidth - tipWidth / 2 - padding));
    setCoords({
      top: rect.top - padding,
      left,
    });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex p-0.5 rounded-full text-neutral-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      {mounted &&
        open &&
        coords &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
            className={cn(
              "fixed z-[9999] pointer-events-none",
              "w-56 sm:w-64 px-3 py-2 rounded-xl text-xs leading-relaxed font-medium text-left",
              "bg-neutral-text text-white shadow-float"
            )}
          >
            {text}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-neutral-text"
              aria-hidden
            />
          </span>,
          document.body
        )}
    </span>
  );
}

export interface LabelWithTipProps {
  children: React.ReactNode;
  tip: string;
  className?: string;
  htmlFor?: string;
  as?: "label" | "span";
}

/** Field label with an inline info tip. */
export function LabelWithTip({
  children,
  tip,
  className,
  htmlFor,
  as = "label",
}: LabelWithTipProps) {
  const Comp = as;
  return (
    <Comp
      htmlFor={as === "label" ? htmlFor : undefined}
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold text-neutral-text",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 min-w-0">{children}</span>
      <InfoTooltip
        text={tip}
        label={`About ${typeof children === "string" ? children : "this field"}`}
      />
    </Comp>
  );
}
