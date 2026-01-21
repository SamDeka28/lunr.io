"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2, ExternalLink, Copy, Check, Edit, Trash2, TrendingUp, Share2, MoreVertical, Calendar, Tag, Lock, BarChart3, QrCode } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { toast } from "sonner";

interface LinksListProps {
  links: any[];
  canCreate: boolean;
  viewType?: "list" | "grid" | "card";
  onSelectionChange?: (count: number) => void;
}

export function LinksList({ links, canCreate, viewType = "list", onSelectionChange }: LinksListProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  // Update parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedLinks.size);
    }
  }, [selectedLinks, onSelectionChange]);

  // Memoize processed links to avoid recalculating on every render
  const processedLinks = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    return links.map((link) => {
      const shortUrl = `${baseUrl}/${link.short_code}`;
      const createdDate = new Date(link.created_at).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
      
      // Format expiration date if exists
      let expirationDate = null;
      if (link.expires_at) {
        expirationDate = new Date(link.expires_at).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric", 
          year: "numeric" 
        });
      }
      
      // Calculate title once
      let title = link.title;
      if (!title) {
        try {
          if (link.original_url) {
            title = `${new URL(link.original_url).hostname} - untitled`;
          } else {
            title = "untitled";
          }
        } catch {
          title = "untitled";
        }
      }
      
      return {
        ...link,
        shortUrl,
        createdDate,
        expirationDate,
        title,
      };
    });
  }, [links]);

  const handleCopy = async (shortUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      toast.success("Link copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Link deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = async (shortUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this link",
          text: "Shortened link",
          url: shortUrl,
        });
        toast.success("Link shared");
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy(shortUrl, "share");
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedLinks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLinks(newSelected);
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-card shadow-soft border border-neutral-border">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-6">
          <Link2 className="h-12 w-12 text-electric-sapphire/60" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-text mb-3">
          No links yet
        </h3>
        <p className="text-sm text-neutral-muted mb-8 max-w-sm mx-auto">
          {canCreate
            ? "Create your first short link to get started."
            : "You've reached your free link limit. Upgrade for more."}
        </p>
        {canCreate && (
          <Link
            href="/dashboard/links/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
          >
            <span className="text-lg">+</span>
            Create Your First Link
          </Link>
        )}
      </div>
    );
  }

  // Render based on view type
  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedLinks.map((link) => {
          const isSelected = selectedLinks.has(link.id);
          const isPasswordProtected = !!link.password_hash;
          const hasQRCode = link.qr_codes && Array.isArray(link.qr_codes) && link.qr_codes.filter((qr: any) => qr.is_active).length > 0;
          const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

          return (
            <div
              key={link.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border p-4 hover:shadow-soft transition-all",
                isSelected && "ring-2 ring-electric-sapphire",
                isExpired && "opacity-75"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(link.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-text mb-2 line-clamp-1">
                    {link.title}
                  </h3>
                  <p className="text-xs text-neutral-muted line-clamp-2 mb-2 font-mono break-all">
                    {link.shortUrl}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {isPasswordProtected && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                        <Lock className="h-3 w-3 text-amber-600" />
                      </div>
                    )}
                    {hasQRCode && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-electric-sapphire/10 border border-electric-sapphire/20">
                        <QrCode className="h-3 w-3 text-electric-sapphire" />
                      </div>
                    )}
                    {link.expirationDate && (
                      <div className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border",
                        isExpired ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                      )}>
                        <Calendar className={cn(
                          "h-3 w-3",
                          isExpired ? "text-red-600" : "text-blue-600"
                        )} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-neutral-muted">
                    <span>{link.click_count || 0} clicks</span>
                    <span>•</span>
                    <span>{link.createdDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold truncate flex-1"
                >
                  View
                </a>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/links/${link.id}/analytics`}
                    className="p-1.5 rounded-lg text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/links/${link.id}/edit`}
                    className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                    title="Edit"
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

  if (viewType === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processedLinks.map((link) => {
          const isSelected = selectedLinks.has(link.id);
          const isPasswordProtected = !!link.password_hash;
          const hasQRCode = link.qr_codes && Array.isArray(link.qr_codes) && link.qr_codes.filter((qr: any) => qr.is_active).length > 0;
          const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

          return (
            <div
              key={link.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border p-6 hover:shadow-soft transition-all group",
                isSelected && "ring-2 ring-electric-sapphire",
                isExpired && "opacity-75"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(link.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-neutral-text mb-3 line-clamp-2">
                    {link.title}
                  </h3>
                  
                  {/* Short URL with Copy */}
                  <div className="flex items-center gap-2 mb-3">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-electric-sapphire hover:text-bright-indigo font-semibold truncate flex-1"
                    >
                      {link.shortUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(link.shortUrl, link.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors flex-shrink-0",
                        copiedId === link.id
                          ? "text-blue-energy bg-blue-energy/10"
                          : "text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10"
                      )}
                      title="Copy"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Original URL */}
                  <a
                    href={link.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-muted hover:text-electric-sapphire flex items-center gap-1.5 mb-4 truncate block"
                  >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{link.original_url}</span>
                  </a>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Password Protection Badge */}
                    {isPasswordProtected && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                        <Lock className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Password Protected</span>
                      </div>
                    )}
                    
                    {/* QR Code Badge */}
                    {hasQRCode && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20">
                        <QrCode className="h-3.5 w-3.5 text-electric-sapphire" />
                        <span className="text-xs font-medium text-electric-sapphire">QR Code</span>
                      </div>
                    )}

                    {/* Expiration Badge */}
                    {link.expirationDate && (
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                        isExpired 
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      )}>
                        <Calendar className={cn(
                          "h-3.5 w-3.5",
                          isExpired ? "text-red-600" : "text-blue-600"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          isExpired ? "text-red-700" : "text-blue-700"
                        )}>
                          {isExpired ? "Expired" : "Expires"} {link.expirationDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-xs text-neutral-muted pb-4 border-b border-neutral-border">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="font-medium">{link.click_count || 0} clicks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{link.createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <Link
                  href={`/dashboard/links/${link.id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                >
                  Edit
                </Link>
                <Link
                  href={`/dashboard/links/${link.id}/analytics`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                >
                  Analytics
                </Link>
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal transition-all"
                >
                  View
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default list view
  return (
    <div className="space-y-0">
      {processedLinks.map((link, index) => {
        const isCopied = copiedId === link.id;
        const isSelected = selectedLinks.has(link.id);

        return (
          <div
            key={link.id}
            className={cn(
              "bg-white border-b border-neutral-border p-5",
              "hover:bg-neutral-bg transition-colors",
              index === 0 && "rounded-t-card border-t",
              index === processedLinks.length - 1 && "rounded-b-card border-b"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(link.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer"
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Short Link */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-neutral-text">
                      {link.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-electric-sapphire hover:text-bright-indigo font-semibold"
                    >
                      {link.shortUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(link.shortUrl, link.id)}
                      className={cn(
                        "p-1 rounded-lg transition-colors",
                        isCopied
                          ? "text-blue-energy bg-blue-energy/10"
                          : "text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10"
                      )}
                      title="Copy"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-muted hover:text-neutral-text flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="truncate max-w-md">{link.original_url}</span>
                    </a>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Password Protection Badge */}
                  {link.password_hash && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Password Protected</span>
                    </div>
                  )}
                  
                  {/* QR Code Badge */}
                  {link.qr_codes && Array.isArray(link.qr_codes) && link.qr_codes.filter((qr: any) => qr.is_active).length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-electric-sapphire/10 border border-electric-sapphire/20">
                      <QrCode className="h-3.5 w-3.5 text-electric-sapphire" />
                      <span className="text-xs font-medium text-electric-sapphire">QR Code</span>
                    </div>
                  )}

                  {/* Expiration Badge */}
                  {link.expirationDate && (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                      new Date(link.expires_at) < new Date()
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    )}>
                      <Calendar className={cn(
                        "h-3.5 w-3.5",
                        new Date(link.expires_at) < new Date() ? "text-red-600" : "text-blue-600"
                      )} />
                      <span className={cn(
                        "text-xs font-medium",
                        new Date(link.expires_at) < new Date() ? "text-red-700" : "text-blue-700"
                      )}>
                        {new Date(link.expires_at) < new Date() ? "Expired" : "Expires"} {link.expirationDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-neutral-muted">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span className="font-medium">{link.click_count || 0} clicks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{link.createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/dashboard/links/${link.id}/edit`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleShare(link.shortUrl)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-blue-energy hover:bg-blue-energy/10 transition-colors"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <Link
                  href={`/dashboard/links/${link.id}/analytics`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* End of Links Indicator */}
      {processedLinks.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 text-sm text-neutral-muted">
            <div className="h-px w-12 bg-neutral-border" />
            <span>You've reached the end of your links</span>
            <div className="h-px w-12 bg-neutral-border" />
          </div>
        </div>
      )}
    </div>
  );
}
