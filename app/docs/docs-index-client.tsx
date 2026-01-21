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
import { docsContent } from "./docs-content";

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

interface DocsIndexClientProps {
  isAuthenticated: boolean;
}

export function DocsIndexClient({ isAuthenticated }: DocsIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = docsContent;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-sm font-semibold mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-5xl font-bold text-neutral-text mb-4">
            Welcome to lunr.to Docs
          </h1>
          <p className="text-xl text-neutral-muted max-w-2xl mx-auto mb-8">
            Everything you need to know about using lunr.to to manage your links, track performance, and grow your business.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-muted" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-border bg-white text-base font-medium text-neutral-text focus:outline-none focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 shadow-soft"
              />
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-neutral-muted mx-auto mb-4" />
            <p className="text-neutral-muted">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => {
              const Icon = iconMap[section.icon] || BookOpen;
              return (
                <Link
                  key={section.id}
                  href={`/docs/${section.id}`}
                  className="bg-white rounded-card border border-neutral-border p-6 hover:shadow-hover transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-colors">
                      <Icon className="h-6 w-6 text-electric-sapphire" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-text mb-2 group-hover:text-electric-sapphire transition-colors">
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
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{article.title}</span>
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

