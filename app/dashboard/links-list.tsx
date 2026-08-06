"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Lock,
  Mail,
  BarChart3,
  QrCode,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface LinksListProps {
  links: any[];
  canCreate: boolean;
  viewType?: "list" | "grid" | "card";
  onSelectionChange?: (count: number) => void;
  isLoading?: boolean;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function faviconUrl(url: string) {
  const host = hostnameOf(url);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

function Favicon({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const src = faviconUrl(url);
  const letter = (title || hostnameOf(url) || "?").charAt(0).toUpperCase();

  if (!src || failed) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-surface text-[11px] font-semibold text-neutral-muted">
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 rounded-2xl bg-neutral-surface object-contain p-1.5"
      onError={() => setFailed(true)}
    />
  );
}

export function LinksList({
  links,
  canCreate,
  viewType = "list",
  onSelectionChange,
  isLoading = false,
}: LinksListProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [displayHost, setDisplayHost] = useState("");

  useEffect(() => {
    setDisplayHost(window.location.host);
  }, []);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedLinks.size);
  }, [selectedLinks, onSelectionChange]);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpenId]);

  const processedLinks = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    return links.map((link) => {
      const shortUrl = `${baseUrl}/${link.short_code}`;
      const createdDate = new Date(link.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      let expirationDate: string | null = null;
      if (link.expires_at) {
        expirationDate = new Date(link.expires_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      let title = link.title;
      if (!title) {
        try {
          title = link.original_url
            ? `${new URL(link.original_url).hostname} — untitled`
            : "Untitled";
        } catch {
          title = "Untitled";
        }
      }

      return {
        ...link,
        shortUrl,
        shortPath: `/${link.short_code}`,
        createdDate,
        expirationDate,
        title,
        host: hostnameOf(link.original_url || ""),
      };
    });
  }, [links]);

  const handleCopy = async (shortUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link? This can't be undone.")) return;
    try {
      const response = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Link deleted");
        router.refresh();
      } else {
        toast.error("Couldn't delete link");
      }
    } catch {
      toast.error("Couldn't delete link");
    }
  };

  const handleShare = async (shortUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Check out this link", url: shortUrl });
        toast.success("Shared");
      } catch {
        /* cancelled */
      }
    } else {
      handleCopy(shortUrl, "share");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLinks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLinks(next);
  };

  const withLoading = (content: ReactNode) => (
    <div className="relative" aria-busy={isLoading}>
      <div
        className={cn(
          "transition-opacity duration-150",
          isLoading && "pointer-events-none opacity-40"
        )}
      >
        {content}
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex min-h-[12rem] items-start justify-center pt-16">
          <div className="flex items-center gap-2 rounded-full border border-neutral-border/80 bg-white px-4 py-2.5 shadow-float">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-neutral-text">Loading links…</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading && links.length === 0) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border/80 bg-white p-4 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5 max-w-[40%]" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return withLoading(
      <div className="rounded-card border border-neutral-border/80 bg-white px-6 py-16 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Link2 className="h-6 w-6" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-neutral-text tracking-tight">No links yet</h3>
        <p className="mx-auto mb-5 max-w-xs text-sm text-neutral-muted leading-relaxed">
          {canCreate
            ? "Create a short link to start tracking clicks."
            : "You've hit your free link limit. Upgrade for more."}
        </p>
        {canCreate && (
          <Link
            href="/dashboard/links/new"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button hover:bg-bright-indigo transition-all"
          >
            Create link
          </Link>
        )}
      </div>
    );
  }

  if (viewType === "grid" || viewType === "card") {
    const cols =
      viewType === "grid"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

    return withLoading(
      <div className={cn("grid gap-3", cols)}>
        {processedLinks.map((link) => {
          const isSelected = selectedLinks.has(link.id);
          const isCopied = copiedId === link.id;
          const isPasswordProtected = !!link.password_hash;
          const hasLeadCapture = !!link.lead_capture_enabled;
          const hasQRCode =
            Array.isArray(link.qr_codes) &&
            link.qr_codes.some((qr: any) => qr.is_active);
          const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

          return (
            <div
              key={link.id}
              className={cn(
                "rounded-card border border-neutral-border/80 bg-white p-4 shadow-soft transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5",
                isSelected && "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/15",
                isExpired && "opacity-60"
              )}
            >
              <div className="mb-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(link.id)}
                  className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40"
                />
                <Favicon url={link.original_url} title={link.title} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-text">{link.title}</p>
                  <p className="truncate text-xs text-neutral-muted">{link.host}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(link.shortUrl, link.id)}
                className="mb-3 flex w-full items-center justify-between gap-2 rounded-lg bg-neutral-bg px-3 py-2 text-left transition-colors hover:bg-neutral-border/50"
              >
                <span className="truncate font-mono text-sm font-medium text-electric-sapphire">
                  {link.shortPath}
                </span>
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0 text-neutral-muted" />
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-neutral-muted">
                <span>{link.click_count || 0} clicks</span>
                <div className="flex items-center gap-2">
                  {isPasswordProtected && <Lock className="h-3.5 w-3.5" />}
                  {hasLeadCapture && <Mail className="h-3.5 w-3.5" />}
                  {hasQRCode && <QrCode className="h-3.5 w-3.5" />}
                  <Link
                    href={`/dashboard/links/${link.id}/analytics`}
                    className="rounded-md p-1 hover:bg-white hover:text-neutral-text"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/links/${link.id}/edit`}
                    className="rounded-md p-1 hover:bg-white hover:text-neutral-text"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // List view — dense continuous panel
  return withLoading(
    <div className="overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft">
      {processedLinks.map((link, index) => {
        const isCopied = copiedId === link.id;
        const isSelected = selectedLinks.has(link.id);
        const isPasswordProtected = !!link.password_hash;
        const hasLeadCapture = !!link.lead_capture_enabled;
        const hasQRCode =
          Array.isArray(link.qr_codes) &&
          link.qr_codes.some((qr: any) => qr.is_active);
        const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
        const menuOpen = menuOpenId === link.id;

        return (
          <div
            key={link.id}
            className={cn(
              "group relative px-3 py-3.5 sm:px-4 sm:py-4 transition-colors",
              index > 0 && "border-t border-neutral-border/70",
              "hover:bg-neutral-bg/60",
              isSelected && "bg-primary/[0.03]",
              isExpired && "opacity-60"
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(link.id)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40"
              />

              <Favicon url={link.original_url} title={link.title} />

              {/* Main */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-text">
                    {link.title}
                  </p>

                  {(isPasswordProtected || hasLeadCapture || hasQRCode || link.expirationDate) && (
                    <span className="hidden items-center gap-1.5 sm:inline-flex shrink-0">
                      {isPasswordProtected && (
                        <span title="Password protected">
                          <Lock className="h-3 w-3 text-neutral-muted" />
                        </span>
                      )}
                      {hasLeadCapture && (
                        <span title="Lead capture enabled">
                          <Mail className="h-3 w-3 text-neutral-muted" />
                        </span>
                      )}
                      {hasQRCode && (
                        <span title="Has QR code">
                          <QrCode className="h-3 w-3 text-neutral-muted" />
                        </span>
                      )}
                      {link.expirationDate && (
                        <span
                          title={isExpired ? "Expired" : `Expires ${link.expirationDate}`}
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-wide",
                            isExpired ? "text-red-500" : "text-neutral-muted"
                          )}
                        >
                          {isExpired ? "Expired" : "Timed"}
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-neutral-muted">
                  <button
                    type="button"
                    onClick={() => handleCopy(link.shortUrl, link.id)}
                    className="inline-flex min-w-0 max-w-[55%] items-center gap-1.5 rounded-md text-left transition-colors hover:opacity-80"
                    title="Copy short link"
                  >
                    <span className="truncate font-mono font-medium text-electric-sapphire">
                      {displayHost ? `${displayHost}${link.shortPath}` : link.shortPath}
                    </span>
                    {isCopied ? (
                      <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 shrink-0 text-neutral-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                  <span className="shrink-0 text-neutral-border">→</span>
                  <a
                    href={link.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 items-center gap-1 truncate hover:text-neutral-text"
                  >
                    <span className="truncate">{link.host || link.original_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Clicks */}
              <div className="hidden w-16 shrink-0 text-right sm:block">
                <p className="text-sm font-semibold tabular-nums text-neutral-text">
                  {link.click_count || 0}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-neutral-muted">clicks</p>
              </div>

              {/* Date */}
              <div className="hidden w-[5.5rem] shrink-0 text-right md:block">
                <p className="text-xs text-neutral-muted">{link.createdDate}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5">
                <span className="mr-1 text-xs font-medium tabular-nums text-neutral-muted sm:hidden">
                  {link.click_count || 0}
                </span>
                <Link
                  href={`/dashboard/links/${link.id}/analytics`}
                  className="rounded-lg p-2 text-neutral-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Link>
                <Link
                  href={`/dashboard/links/${link.id}/edit`}
                  className="rounded-lg p-2 text-neutral-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleShare(link.shortUrl)}
                  className="hidden rounded-lg p-2 text-neutral-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text sm:inline-flex"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpen ? null : link.id);
                    }}
                    className="rounded-lg p-2 text-neutral-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text"
                    title="More"
                    aria-expanded={menuOpen}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-border bg-white py-1 shadow-hover"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-text hover:bg-neutral-bg"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          handleDelete(link.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
