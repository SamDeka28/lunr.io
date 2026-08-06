"use client";

import {
  BookOpen,
  ChevronRight,
  Home,
  ArrowLeft,
  ChevronLeft,
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
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { MobileBottomNav, MobileBottomNavItem } from "@/components/mobile-bottom-nav";
import { docsContent } from "../../docs-content";
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
  Lightbulb,
};

interface DocsArticleClientProps {
  section: typeof docsContent[0];
  article: typeof docsContent[0]["articles"][0];
  isAuthenticated: boolean;
}

export function DocsArticleClient({
  section,
  article,
  isAuthenticated,
}: DocsArticleClientProps) {
  const visibleDocs = docsContent.filter(
    (s) => s.id !== "campaigns" || isCampaignsEnabled()
  );
  const Icon = iconMap[section.icon] || BookOpen;
  const currentIndex = section.articles.findIndex((a) => a.id === article.id);
  const prevArticle =
    currentIndex > 0 ? section.articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < section.articles.length - 1
      ? section.articles[currentIndex + 1]
      : null;

  const renderMarkdown = (text: string) => {
    // Links first so nested formatting inside labels still works after
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary font-medium underline underline-offset-2 hover:text-bright-indigo">$1</a>'
    );
    // Process bold text
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-neutral-text">$1</strong>'
    );
    // Process inline code
    text = text.replace(
      /`([^`]+)`/g,
      '<code class="bg-neutral-bg border border-neutral-border rounded px-1.5 py-0.5 font-mono text-sm text-primary">$1</code>'
    );
    return { __html: text };
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: "ul" | "ol" | null = null;
    let listKey = 0;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeBlockLanguage = "";
    let tableRows: string[][] = [];
    let tableHasHeader = false;

    const isTableRow = (line: string) => {
      const t = line.trim();
      return t.startsWith("|") && t.includes("|", 1);
    };

    const isTableSeparator = (line: string) => {
      const t = line.trim();
      if (!t.includes("|")) return false;
      // e.g. |---|---| or | :--- | ---: |
      const cells = t.replace(/^\|/, "").replace(/\|$/, "").split("|");
      return (
        cells.length > 0 &&
        cells.every((cell) => /^:?-{1,}:?$/.test(cell.trim()))
      );
    };

    const parseTableRow = (line: string) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType === "ul" ? "ul" : "ol";
        elements.push(
          <ListTag
            key={`list-${listKey++}`}
            className={cn(
              "my-6 space-y-3",
              listType === "ul" ? "list-disc" : "list-decimal",
              "ml-6"
            )}
          >
            {currentList.map((item, i) => (
              <li
                key={i}
                className="text-neutral-muted leading-relaxed"
                dangerouslySetInnerHTML={renderMarkdown(item)}
              />
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        const codeContent = codeBlockLines.join("\n");
        elements.push(
          <pre
            key={`code-${listKey++}`}
            className="bg-neutral-bg border border-neutral-border rounded-lg p-4 overflow-x-auto my-6"
          >
            <code
              className={cn(
                "text-sm font-mono text-neutral-text block whitespace-pre",
                codeBlockLanguage && `language-${codeBlockLanguage}`
              )}
            >
              {codeContent}
            </code>
          </pre>
        );
        codeBlockLines = [];
        codeBlockLanguage = "";
      }
    };

    const flushTable = () => {
      if (tableRows.length === 0) return;

      const header = tableHasHeader ? tableRows[0] : null;
      const body = tableHasHeader ? tableRows.slice(1) : tableRows;

      elements.push(
        <div
          key={`table-${listKey++}`}
          className="my-6 overflow-x-auto rounded-xl border border-neutral-border/80 bg-white shadow-soft"
        >
          <table className="w-full min-w-[28rem] text-left text-sm border-collapse">
            {header && (
              <thead>
                <tr className="bg-neutral-bg/80 border-b border-neutral-border/80">
                  {header.map((cell, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-semibold text-neutral-text whitespace-nowrap"
                      dangerouslySetInnerHTML={renderMarkdown(cell)}
                    />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-neutral-border/60 last:border-b-0 align-top"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "px-4 py-3 text-neutral-muted leading-relaxed",
                        ci === 0 && "font-medium text-neutral-text w-[34%] min-w-[8rem]"
                      )}
                      dangerouslySetInnerHTML={renderMarkdown(cell)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      tableRows = [];
      tableHasHeader = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code block start/end
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          flushCodeBlock();
          const match = trimmed.match(/^```(\w+)?/);
          codeBlockLanguage = match?.[1] || "";
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Markdown tables (GFM pipe tables)
      if (isTableRow(trimmed)) {
        if (isTableSeparator(trimmed)) {
          // Separator after the first row marks that row as header
          if (tableRows.length === 1) tableHasHeader = true;
          return;
        }
        flushList();
        flushCodeBlock();
        tableRows.push(parseTableRow(trimmed));
        return;
      }

      if (tableRows.length > 0) {
        flushTable();
      }

      // Headings (## through ######)
      const headingMatch = trimmed.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        flushList();
        flushTable();
        flushCodeBlock();
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        elements.push(
          <HeadingTag
            key={`heading-${idx}`}
            className={cn(
              "font-bold text-neutral-text mt-10 mb-4 first:mt-0",
              level === 2 && "text-2xl",
              level === 3 && "text-xl",
              level === 4 && "text-lg",
              level >= 5 && "text-base"
            )}
          >
            {text}
          </HeadingTag>
        );
        return;
      }

      // Numbered lists
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)$/);
      if (numberedMatch) {
        if (listType !== "ol") {
          flushList();
          flushTable();
          flushCodeBlock();
          listType = "ol";
        }
        currentList.push(numberedMatch[2]);
        return;
      }

      // Bullet lists
      if (trimmed.startsWith("- ")) {
        if (listType !== "ul") {
          flushList();
          flushTable();
          flushCodeBlock();
          listType = "ul";
        }
        currentList.push(trimmed.substring(2));
        return;
      }

      // Empty line
      if (trimmed === "") {
        flushList();
        flushTable();
        flushCodeBlock();
        return;
      }

      // CTA marker
      if (trimmed === "<!-- CTA:API_REFERENCE -->") {
        flushList();
        flushTable();
        flushCodeBlock();
        elements.push(
          <div
            key={`cta-${idx}`}
            className="my-8 p-6 bg-primary/10 rounded-xl border-2 border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-text mb-2">
                  Explore API Reference
                </h3>
                <p className="text-sm text-neutral-muted mb-4">
                  View detailed API documentation with code examples, request/response formats, and interactive guides for all endpoints.
                </p>
                <Link
                  href="/api-reference"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-bright-indigo transition-all shadow-button"
                >
                  <span>View API Reference</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        );
        return;
      }

      // Regular paragraph
      flushList();
      flushTable();
      flushCodeBlock();
      elements.push(
        <p
          key={`para-${idx}`}
          className="mb-6 text-neutral-muted leading-relaxed text-base"
          dangerouslySetInnerHTML={renderMarkdown(trimmed)}
        />
      );
    });

    flushList();
    flushCodeBlock();
    flushTable();
    return elements;
  };

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
        <div className="lg:hidden mb-6">
          <nav className="flex items-center gap-2 text-sm text-neutral-muted flex-wrap bg-white rounded-card border border-neutral-border p-3">
            <Link
              href="/docs"
              className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Docs</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-neutral-border" />
            <Link
              href={`/docs/${section.id}`}
              className="hover:text-primary transition-colors font-medium"
            >
              {section.title}
            </Link>
            <ChevronRight className="h-3 w-3 text-neutral-border" />
            <span className="text-neutral-text font-semibold line-clamp-1">
              {article.title}
            </span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <nav className="flex items-center gap-2 text-sm text-neutral-muted flex-wrap bg-white rounded-card border border-neutral-border p-3">
                <Link
                  href="/docs"
                  className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Docs</span>
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <Link
                  href={`/docs/${section.id}`}
                  className="hover:text-primary transition-colors font-medium"
                >
                  {section.title}
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <span className="text-neutral-text font-semibold line-clamp-1">
                  {article.title}
                </span>
              </nav>

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
                  {section.articles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/docs/${section.id}/${a.id}`}
                      className={cn(
                        "block px-3 py-2.5 rounded-lg text-sm transition-all",
                        a.id === article.id
                          ? "bg-primary text-white font-semibold shadow-sm"
                          : "text-neutral-muted hover:text-primary hover:bg-neutral-bg font-medium"
                      )}
                    >
                      {a.title}
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
                  {visibleDocs.map((s) => {
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
            <article className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
              <div className="bg-primary/[0.04] border-b border-neutral-border px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
                <Link
                  href={`/docs/${section.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-muted hover:text-primary transition-colors mb-4 sm:mb-6 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to {section.title}</span>
                </Link>
                <div className="flex items-start gap-3 mb-3 sm:mb-4">
                  <div className="p-2 rounded-lg bg-primary/15 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-text">
                    {article.title}
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-neutral-muted">{section.description}</p>
              </div>

              <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-none overflow-x-auto">
                <div className="prose prose-sm sm:prose-lg max-w-none">
                  {renderContent(article.content)}
                </div>
              </div>

              <div className="px-4 sm:px-8 pb-6 sm:pb-8">
                <div className="pt-6 sm:pt-8 border-t border-neutral-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/docs/${section.id}/${prevArticle.id}`}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border-2 border-neutral-border hover:border-primary hover:bg-primary/5 transition-all group flex-1 sm:max-w-xs"
                    >
                      <ChevronLeft className="h-5 w-5 text-neutral-muted group-hover:text-primary transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wide mb-1">Previous</div>
                        <div className="text-sm font-semibold text-neutral-text group-hover:text-primary transition-colors truncate">
                          {prevArticle.title}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block flex-1" />
                  )}
                  {nextArticle ? (
                    <Link
                      href={`/docs/${section.id}/${nextArticle.id}`}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border-2 border-neutral-border hover:border-primary hover:bg-primary/5 transition-all group flex-1 sm:max-w-xs sm:ml-auto text-right"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wide mb-1">Next</div>
                        <div className="text-sm font-semibold text-neutral-text group-hover:text-primary transition-colors truncate">
                          {nextArticle.title}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-muted group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  ) : (
                    <div className="hidden sm:block flex-1" />
                  )}
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>

      <MobileBottomNav>
        {visibleDocs.map((s) => {
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

