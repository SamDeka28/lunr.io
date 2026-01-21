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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { docsContent } from "../../docs-content";

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
  const Icon = iconMap[section.icon] || BookOpen;
  const currentIndex = section.articles.findIndex((a) => a.id === article.id);
  const prevArticle =
    currentIndex > 0 ? section.articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < section.articles.length - 1
      ? section.articles[currentIndex + 1]
      : null;

  const renderMarkdown = (text: string) => {
    // Process bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-neutral-text">$1</strong>');
    // Process inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-neutral-bg border border-neutral-border rounded px-1.5 py-0.5 font-mono text-sm text-electric-sapphire">$1</code>');
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
            <code className={cn(
              "text-sm font-mono text-neutral-text block whitespace-pre",
              codeBlockLanguage && `language-${codeBlockLanguage}`
            )}>
              {codeContent}
            </code>
          </pre>
        );
        codeBlockLines = [];
        codeBlockLanguage = "";
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code block start/end
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          // Start of code block
          flushList();
          flushCodeBlock();
          const match = trimmed.match(/^```(\w+)?/);
          codeBlockLanguage = match?.[1] || "";
          inCodeBlock = true;
        }
        return;
      }

      // If we're in a code block, collect lines
      if (inCodeBlock) {
        codeBlockLines.push(line); // Keep original line (with indentation)
        return;
      }

      // Headings
      if (trimmed.startsWith("## ")) {
        flushList();
        flushCodeBlock();
        const text = trimmed.replace(/^##+\s/, "");
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        elements.push(
          <HeadingTag
            key={`heading-${idx}`}
            className={cn(
              "font-bold text-neutral-text mt-10 mb-4 first:mt-0",
              level === 2 && "text-2xl",
              level === 3 && "text-xl",
              level === 4 && "text-lg"
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
          flushCodeBlock();
          listType = "ul";
        }
        currentList.push(trimmed.substring(2));
        return;
      }

      // Empty line - flush list and code block, add spacing
      if (trimmed === "") {
        flushList();
        flushCodeBlock();
        return;
      }

      // CTA marker
      if (trimmed === "<!-- CTA:API_REFERENCE -->") {
        flushList();
        flushCodeBlock();
        elements.push(
          <div
            key={`cta-${idx}`}
            className="my-8 p-6 bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-xl border-2 border-electric-sapphire/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center flex-shrink-0">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all shadow-button"
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
    return elements;
  };

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
                <Link
                  href="/docs"
                  className="hover:text-electric-sapphire transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Docs</span>
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <Link
                  href={`/docs/${section.id}`}
                  className="hover:text-electric-sapphire transition-colors font-medium"
                >
                  {section.title}
                </Link>
                <ChevronRight className="h-3 w-3 text-neutral-border" />
                <span className="text-neutral-text font-semibold line-clamp-1">
                  {article.title}
                </span>
              </nav>

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
                  {section.articles.map((a) => (
                    <Link
                      key={a.id}
                      href={`/docs/${section.id}/${a.id}`}
                      className={cn(
                        "block px-3 py-2.5 rounded-lg text-sm transition-all",
                        a.id === article.id
                          ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white font-semibold shadow-sm"
                          : "text-neutral-muted hover:text-electric-sapphire hover:bg-neutral-bg font-medium"
                      )}
                    >
                      {a.title}
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
            <article className="bg-white rounded-card border border-neutral-border shadow-soft overflow-hidden">
              {/* Article Header */}
              <div className="bg-gradient-to-br from-electric-sapphire/5 via-bright-indigo/5 to-vivid-royal/5 border-b border-neutral-border px-8 pt-8 pb-6">
                <Link
                  href={`/docs/${section.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-muted hover:text-electric-sapphire transition-colors mb-6 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to {section.title}</span>
                </Link>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20">
                    <Icon className="h-5 w-5 text-electric-sapphire" />
                  </div>
                  <h1 className="text-4xl font-bold text-neutral-text">
                    {article.title}
                  </h1>
                </div>
                <p className="text-neutral-muted text-base">{section.description}</p>
              </div>

              {/* Article Content */}
              <div className="px-8 py-8 max-w-none">
                <div className="prose prose-lg max-w-none">
                  {renderContent(article.content)}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-8 pb-8">
                <div className="pt-8 border-t border-neutral-border flex items-center justify-between gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/docs/${section.id}/${prevArticle.id}`}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5 transition-all group flex-1 max-w-xs"
                    >
                      <ChevronLeft className="h-5 w-5 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wide mb-1">Previous</div>
                        <div className="text-sm font-semibold text-neutral-text group-hover:text-electric-sapphire transition-colors truncate">
                          {prevArticle.title}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {nextArticle ? (
                    <Link
                      href={`/docs/${section.id}/${nextArticle.id}`}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5 transition-all group flex-1 max-w-xs ml-auto text-right"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wide mb-1">Next</div>
                        <div className="text-sm font-semibold text-neutral-text group-hover:text-electric-sapphire transition-colors truncate">
                          {nextArticle.title}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}

