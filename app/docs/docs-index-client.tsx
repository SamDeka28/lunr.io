"use client";

import { useState } from "react";
import {
  BookOpen,
  Link2,
  QrCode,
  FileText,
  BarChart3,
  Monitor,
  Globe,
  CreditCard,
  Search,
  ArrowRight,
  Zap,
  HelpCircle,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { docsContent } from "./docs-content";
import { isCampaignsEnabled } from "@/lib/features";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Link2,
  QrCode,
  FileText,
  BarChart3,
  Monitor,
  Globe,
  CreditCard,
  Code,
  HelpCircle,
};

interface DocsIndexClientProps {
  isAuthenticated: boolean;
}

export function DocsIndexClient({ isAuthenticated }: DocsIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = docsContent.filter(
    (section) => section.id !== "campaigns" || isCampaignsEnabled()
  );

  const filteredSections = sections.map((section) => ({
    ...section,
    articles: section.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.articles.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="border-b border-neutral-border/70 bg-white/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <BrandLogo href={null} variant="full" size="sm" className="sm:hidden" />
              <BrandLogo href={null} variant="full" size="md" className="hidden sm:block" />
              <span className="text-sm text-neutral-muted shrink-0">Docs</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-neutral-muted hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-white text-sm",
                    "bg-primary",
                    "hover:bg-bright-indigo",
                    "transition-all active:scale-[0.98] shadow-button"
                  )}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-text mb-4">
            Welcome to lunr.to Docs
          </h1>
          <p className="text-base sm:text-xl text-neutral-muted max-w-2xl mx-auto mb-8">
            Everything you need to know about using lunr.to to manage your links, track performance, and grow your business.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-muted" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-full border border-neutral-border/80 bg-white text-base font-medium text-neutral-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-soft"
              />
            </div>
          </div>
        </div>

        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-neutral-muted mx-auto mb-4" />
            <p className="text-neutral-muted">No results found for &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSections.map((section) => {
              const Icon = iconMap[section.icon] || BookOpen;
              return (
                <Link
                  key={section.id}
                  href={`/docs/${section.id}`}
                  className="bg-white rounded-card border border-neutral-border p-5 sm:p-6 hover:shadow-hover transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-neutral-text mb-2 group-hover:text-primary transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-neutral-muted mb-4">{section.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {section.articles.slice(0, 3).map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center gap-2 text-sm text-neutral-muted group-hover:text-neutral-text transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span className="truncate">{article.title}</span>
                      </div>
                    ))}
                    {section.articles.length > 3 && (
                      <div className="text-xs text-neutral-muted pt-2">
                        +{section.articles.length - 3} more articles
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
