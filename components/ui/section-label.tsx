import { cn } from "@/lib/utils/cn";

export type SectionLabelAlign = "center" | "left";
export type SectionLabelTone = "default" | "onDark";

export interface SectionLabelProps {
  children: React.ReactNode;
  align?: SectionLabelAlign;
  tone?: SectionLabelTone;
  className?: string;
}

/**
 * Quiet section orientation label — not a soft primary pill.
 * Centered: short rules flanking muted text.
 * Left: solid primary tick + muted text.
 */
export function SectionLabel({
  children,
  align = "center",
  tone = "default",
  className,
}: SectionLabelProps) {
  const isDark = tone === "onDark";
  const rule = isDark ? "bg-white/35" : "bg-primary/50";
  const text = isDark ? "text-white/75" : "text-neutral-muted";

  if (align === "left") {
    return (
      <div className={cn("mb-3 flex items-center gap-2.5", className)}>
        <span
          className={cn("h-3.5 w-0.5 shrink-0 rounded-full", isDark ? "bg-white/70" : "bg-primary")}
          aria-hidden
        />
        <p className={cn("text-[13px] font-medium tracking-wide", text)}>
          {children}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("mb-4 flex items-center justify-center gap-3", className)}>
      <span className={cn("h-px w-6 shrink-0", rule)} aria-hidden />
      <p className={cn("text-[13px] font-medium tracking-wide", text)}>
        {children}
      </p>
      <span className={cn("h-px w-6 shrink-0", rule)} aria-hidden />
    </div>
  );
}
