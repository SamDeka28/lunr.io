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
import { docsContent } from "../docs-content";

const iconMap: Record<string, React.ComponentType<any>> = {
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
  section: typeof docsContent[0];
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
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="border-b border-neutral-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-neutral-text">lunr.to</span>
              <span className="text-sm text-neutral-muted">Docs</span>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-neutral-muted hover:text-electric-sapphire transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-semibold text-white text-sm",
                    "bg-gradient-to-r from-electric-sapphire to-bright-indigo",
                    "hover:from-bright-indigo hover:to-vivid-royal",
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm text-neutral-muted flex-wrap bg-white rounded-card border border-neutral-border p-3">
                <Link href="/docs" className="hover:text-electric-sapphire transition-colors flex items-center gap-1.5 font-medium">
                  <Home className="h-3.5 w-3.5" />
                  <span>Docs</span>
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <span className="text-neutral-text font-semibold">{section.title}</span>
              </nav>

              {/* Search */}
              <div className="bg-white rounded-card border border-neutral-border shadow-soft p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-neutral-border bg-neutral-bg text-sm font-medium text-neutral-text focus:outline-none focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40"
                  />
                </div>
              </div>

              {/* Section Navigation */}
              <div className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 border-b border-neutral-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20">
                      <Icon className="h-4 w-4 text-electric-sapphire" />
                    </div>
                    <h3 className="font-bold text-neutral-text text-sm">{section.title}</h3>
                  </div>
                </div>
                <nav className="p-2">
                  {section.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/docs/${section.id}/${article.id}`}
                      className="block px-3 py-2.5 rounded-lg text-sm text-neutral-muted hover:text-electric-sapphire hover:bg-neutral-bg transition-all font-medium"
                    >
                      {article.title}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* All Sections */}
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
                            ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire font-semibold"
                            : "text-neutral-muted hover:text-electric-sapphire hover:bg-neutral-bg font-medium"
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

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-br from-electric-sapphire/5 via-bright-indigo/5 to-vivid-royal/5 border-b border-neutral-border px-8 pt-8 pb-6">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-muted hover:text-electric-sapphire transition-colors mb-6 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Documentation</span>
                </Link>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20">
                    <Icon className="h-6 w-6 text-electric-sapphire" />
                  </div>
                  <h1 className="text-4xl font-bold text-neutral-text">{section.title}</h1>
                </div>
                <p className="text-lg text-neutral-muted leading-relaxed">{section.description}</p>
              </div>

              {/* Articles List */}
              <div className="p-8">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-bg mb-4">
                      <Search className="h-8 w-8 text-neutral-muted" />
                    </div>
                    <p className="text-neutral-muted text-lg font-medium">No articles found for "{searchQuery}"</p>
                    <p className="text-neutral-muted text-sm mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/docs/${section.id}/${article.id}`}
                        className="block p-6 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:bg-gradient-to-br hover:from-electric-sapphire/5 hover:to-bright-indigo/5 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-neutral-text mb-3 group-hover:text-electric-sapphire transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-neutral-muted leading-relaxed line-clamp-2">
                              {article.content.split("\n\n")[0].replace(/\*\*/g, "").replace(/`/g, "")}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-muted group-hover:text-electric-sapphire group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
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
    </div>
  );
}

