"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  ChevronRight,
  Home,
  ArrowLeft,
  Link2,
  QrCode,
  FileText,
  BarChart3,
  Monitor,
  Globe,
  CreditCard,
  Zap,
  HelpCircle,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { MobileBottomNav, MobileBottomNavItem } from "@/components/mobile-bottom-nav";
import { docsContent } from "../docs-content";

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

interface DocsSectionClientProps {
  section: (typeof docsContent)[0];
  isAuthenticated: boolean;
}

export function DocsSectionClient({ section, isAuthenticated }: DocsSectionClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const Icon = iconMap[section.icon] || BookOpen;

  const filteredArticles = section.articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-bg pb-20 lg:pb-0">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile breadcrumbs + search */}
        <div className="lg:hidden space-y-4 mb-6">
          <nav className="flex items-center gap-2 text-sm text-neutral-muted flex-wrap bg-white rounded-card border border-neutral-border p-3">
            <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
              <Home className="h-3.5 w-3.5" />
              <span>Docs</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-neutral-border" />
            <span className="text-neutral-text font-semibold">{section.title}</span>
          </nav>
          <div className="relative bg-white rounded-card border border-neutral-border p-3">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-neutral-border bg-neutral-bg text-sm font-medium text-neutral-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <nav className="flex items-center gap-2 text-sm text-neutral-muted flex-wrap bg-white rounded-card border border-neutral-border p-3">
                <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                  <Home className="h-3.5 w-3.5" />
                  <span>Docs</span>
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <span className="text-neutral-text font-semibold">{section.title}</span>
              </nav>

              <div className="bg-white rounded-card border border-neutral-border shadow-soft p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-neutral-border bg-neutral-bg text-sm font-medium text-neutral-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
                <div className="bg-primary/10 border-b border-neutral-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/15">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-neutral-text text-sm">{section.title}</h3>
                  </div>
                </div>
                <nav className="p-2">
                  {section.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/docs/${section.id}/${article.id}`}
                      className="block px-3 py-2.5 rounded-lg text-sm text-neutral-muted hover:text-primary hover:bg-neutral-bg transition-all font-medium"
                    >
                      {article.title}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
                <div className="bg-neutral-bg border-b border-neutral-border px-4 py-3">
                  <h4 className="text-xs font-bold text-neutral-muted uppercase tracking-wider">
                    All Sections
                  </h4>
                </div>
                <nav className="p-2 space-y-0.5">
                  {docsContent.map((s) => {
                    const SectionIcon = iconMap[s.icon] || BookOpen;
                    return (
                      <Link
                        key={s.id}
                        href={`/docs/${s.id}`}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all",
                          s.id === section.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-neutral-muted hover:text-primary hover:bg-neutral-bg font-medium"
                        )}
                      >
                        <SectionIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3 min-w-0">
            <div className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
              <div className="bg-primary/[0.04] border-b border-neutral-border px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-muted hover:text-primary transition-colors mb-4 sm:mb-6 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Documentation</span>
                </Link>
                <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-primary/15 shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-text">{section.title}</h1>
                </div>
                <p className="text-base sm:text-lg text-neutral-muted leading-relaxed">{section.description}</p>
              </div>

              <div className="p-4 sm:p-8">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-bg mb-4">
                      <Search className="h-8 w-8 text-neutral-muted" />
                    </div>
                    <p className="text-neutral-muted text-base sm:text-lg font-medium">No articles found for &quot;{searchQuery}&quot;</p>
                    <p className="text-neutral-muted text-sm mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/docs/${section.id}/${article.id}`}
                        className="block p-4 sm:p-6 rounded-xl border-2 border-neutral-border hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-text mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm sm:text-base text-neutral-muted leading-relaxed line-clamp-2">
                              {article.content.split("\n\n")[0].replace(/\*\*/g, "").replace(/`/g, "")}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav>
        {docsContent.map((s) => {
          const SectionIcon = iconMap[s.icon] || BookOpen;
          return (
            <MobileBottomNavItem
              key={s.id}
              href={`/docs/${s.id}`}
              active={s.id === section.id}
              icon={<SectionIcon />}
              label={s.title}
            />
          );
        })}
      </MobileBottomNav>
    </div>
  );
}
