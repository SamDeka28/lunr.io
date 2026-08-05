"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

const TIPS = [
  {
    title: "Custom back-halves",
    body: (
      <>
        Memorable short links like{" "}
        <code className="text-[11px] font-mono bg-neutral-surface px-1.5 py-0.5 rounded-md border border-neutral-border/80">
          lunr.to/mybrand
        </code>
      </>
    ),
  },
  {
    title: "Track performance",
    body: "Monitor clicks, locations, and devices from Analytics.",
  },
  {
    title: "QR codes",
    body: "Generate QR codes for print and offline sharing.",
  },
];

const LINKS = [
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/qr", label: "QR codes" },
  { href: "/docs", label: "Documentation" },
  { href: "/dashboard/billing", label: "Plans & features" },
];

export function HelpfulContent({ linkCount }: { linkCount: number }) {
  return (
    <aside className="rounded-card bg-white border border-neutral-border/80 shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-border/70 bg-gradient-to-br from-primary/[0.04] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-text tracking-tight">Tips</h3>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {linkCount === 0 && (
          <div className="rounded-2xl bg-primary/5 border border-primary/10 px-3.5 py-3">
            <h4 className="text-sm font-semibold text-neutral-text mb-1">Getting started</h4>
            <p className="text-xs text-neutral-muted leading-relaxed">
              Create a short link to start tracking clicks and sharing a cleaner URL.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {TIPS.map((tip) => (
            <li key={tip.title}>
              <div className="text-sm font-medium text-neutral-text">{tip.title}</div>
              <p className="text-xs text-neutral-muted leading-relaxed mt-1">{tip.body}</p>
            </li>
          ))}
        </ul>

        <div className="border-t border-neutral-border/70 pt-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-2.5">
            Shortcuts
          </h4>
          <nav className="space-y-0.5">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm text-neutral-muted hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {item.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-40" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
