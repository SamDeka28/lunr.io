"use client";

import { Link2, QrCode, BarChart3, BookOpen, ExternalLink, Sparkles, TrendingUp, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function HelpfulContent({ linkCount }: { linkCount: number }) {
  return (
    <>
      {/* Getting Started */}
      {linkCount === 0 && (
        <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-electric-sapphire" />
            </div>
            <h3 className="text-lg font-bold text-neutral-text">Getting started</h3>
          </div>
          <div className="space-y-3 text-sm text-neutral-muted leading-relaxed">
            <p>
              Create your first short link using the form above. Short links are perfect for sharing on social media, in emails, or anywhere you need a concise URL.
            </p>
            <p>
              Once created, you can track clicks, view analytics, and manage all your links from this dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-neon-pink" />
          </div>
          <h3 className="text-lg font-bold text-neutral-text">Quick tips</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-electric-sapphire">1</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-text mb-1">Use custom back-halves</p>
              <p className="text-xs text-neutral-muted leading-relaxed">
                Create memorable short links that reflect your brand. For example: <code className="text-xs bg-neutral-bg px-1.5 py-0.5 rounded font-mono">lunr.to/mybrand</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-energy">2</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-text mb-1">Track your performance</p>
              <p className="text-xs text-neutral-muted leading-relaxed">
                Monitor clicks, locations, and devices to understand how your links are performing.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-neon-pink">3</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-text mb-1">Create QR codes</p>
              <p className="text-xs text-neutral-muted leading-relaxed">
                Generate QR codes for your links to make them easy to share offline or in print materials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gradient-to-br from-electric-sapphire/5 via-bright-indigo/5 to-vivid-royal/5 rounded-card p-6 border border-electric-sapphire/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-electric-sapphire" />
          </div>
          <h3 className="text-lg font-bold text-neutral-text">Resources</h3>
        </div>
        <div className="space-y-2">
          <Link
            href="/dashboard/analytics"
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-electric-sapphire" />
              <span className="text-sm font-semibold text-neutral-text">View Analytics</span>
            </div>
            <ExternalLink className="h-4 w-4 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
          </Link>
          <Link
            href="/dashboard/qr"
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <QrCode className="h-4 w-4 text-neon-pink" />
              <span className="text-sm font-semibold text-neutral-text">QR Code Generator</span>
            </div>
            <ExternalLink className="h-4 w-4 text-neutral-muted group-hover:text-neon-pink transition-colors" />
          </Link>
          <Link
            href="/docs"
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-blue-energy" />
              <span className="text-sm font-semibold text-neutral-text">Documentation</span>
            </div>
            <ExternalLink className="h-4 w-4 text-neutral-muted group-hover:text-blue-energy transition-colors" />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-energy" />
          </div>
          <h3 className="text-lg font-bold text-neutral-text">Features</h3>
        </div>
        <div className="space-y-2.5 text-sm text-neutral-muted">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-electric-sapphire" />
            <span>Real-time click tracking</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-neon-pink" />
            <span>Custom back-halves</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-energy" />
            <span>QR code generation</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-electric-sapphire" />
            <span>Analytics dashboard</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-neon-pink" />
            <span>Link expiration dates</span>
          </div>
        </div>
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-electric-sapphire hover:text-bright-indigo transition-colors"
        >
          View all features <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}
