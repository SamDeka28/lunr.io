"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Full-bleed create/edit layout: form + sticky preview sit adjacent and centered.
 * Uses min-height (not fixed height) so content isn't clipped at the bottom.
 */
export function FormWithPreviewShell({
  form,
  preview,
  className,
}: {
  form: React.ReactNode;
  preview: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-[calc(100dvh-3.75rem)] -m-4 sm:-m-6 lg:-m-8",
        className
      )}
    >
      <div className="p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20">
        <div className="mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-center gap-5 lg:gap-6 xl:gap-8 w-fit max-w-full">
          <div className="w-full max-w-2xl space-y-6 shrink-0 min-w-0 lg:w-[36rem] xl:w-[42rem]">
            {form}
          </div>

          <aside className="w-full lg:w-80 xl:w-[22rem] shrink-0 lg:sticky lg:top-24 self-start">
            <div className="rounded-special border border-neutral-border/70 bg-white/80 backdrop-blur-xl shadow-soft p-5 xl:p-6 space-y-5">
              {preview}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function FormPreviewHeader({
  title = "Preview",
  description = "Live preview of your changes",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mb-1">
      <h3 className="text-base font-semibold text-neutral-text tracking-tight">{title}</h3>
      <p className="text-xs text-neutral-muted mt-0.5 leading-relaxed">{description}</p>
    </div>
  );
}

export function FormModeTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string }>;
}) {
  return (
    <div className="flex p-1 bg-neutral-surface/90 rounded-full w-fit border border-neutral-border/80 shadow-soft">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            value === opt.id
              ? "bg-white text-primary shadow-soft"
              : "text-neutral-muted hover:text-neutral-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FormAccordion({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-card overflow-hidden shadow-soft border border-neutral-border/80">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-bg/50 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-text tracking-tight">{title}</span>
        <svg
          className={cn(
            "h-4 w-4 text-neutral-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-5 pb-5 animate-slide-reveal">{children}</div>}
    </div>
  );
}

export function PreviewPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-border/80 bg-neutral-bg/50 p-6 flex flex-col items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Skeleton matching FormWithPreviewShell — use in loading.tsx for create/edit routes */
export function FormWithPreviewSkeleton({
  titleWidth = "w-56",
  tabs = true,
}: {
  titleWidth?: string;
  tabs?: boolean;
}) {
  return (
    <div className="min-h-[calc(100dvh-3.75rem)] -m-4 sm:-m-6 lg:-m-8">
      <div className="p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20">
        <div className="mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-center gap-5 lg:gap-6 xl:gap-8 w-fit max-w-full">
          <div className="w-full max-w-2xl space-y-5 shrink-0 min-w-0 lg:w-[36rem] xl:w-[42rem]">
            <div className="space-y-2">
              <div className={cn("h-8 bg-neutral-surface rounded-xl animate-pulse", titleWidth)} />
              <div className="h-4 w-72 max-w-full bg-neutral-surface rounded-lg animate-pulse" />
            </div>
            {tabs && (
              <div className="h-10 w-48 bg-neutral-surface rounded-full animate-pulse" />
            )}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-card border border-neutral-border/80 bg-white shadow-soft overflow-hidden"
              >
                <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-border/50">
                  <div className="h-4 w-28 bg-neutral-surface rounded-lg animate-pulse" />
                  <div className="h-4 w-4 bg-neutral-surface rounded animate-pulse" />
                </div>
                {i === 1 && (
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-neutral-surface rounded animate-pulse" />
                      <div className="h-11 w-full bg-neutral-surface rounded-2xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-neutral-surface rounded animate-pulse" />
                      <div className="h-11 w-full bg-neutral-surface rounded-2xl animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-11 bg-neutral-surface rounded-2xl animate-pulse" />
                      <div className="h-11 bg-neutral-surface rounded-2xl animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-24 bg-neutral-surface rounded-full animate-pulse" />
              <div className="h-11 w-36 bg-neutral-surface rounded-full animate-pulse" />
            </div>
          </div>

          <aside className="hidden lg:block w-80 xl:w-[22rem] shrink-0">
            <div className="rounded-special border border-neutral-border/70 bg-white/80 shadow-soft p-5 xl:p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-neutral-surface rounded-lg animate-pulse" />
                <div className="h-3 w-40 bg-neutral-surface rounded animate-pulse" />
              </div>
              <div className="h-56 rounded-2xl bg-neutral-surface animate-pulse" />
              <div className="h-16 rounded-card bg-neutral-surface animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
