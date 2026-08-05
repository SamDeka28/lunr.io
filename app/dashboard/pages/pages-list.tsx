"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, ExternalLink, Copy, Check, Share2, MoreVertical, Calendar, Tag, Eye, Edit, BarChart3, Crown, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface PagesListProps {
  pages: any[];
  canCreate: boolean;
  viewType?: "list" | "grid" | "card";
  selectedCount?: number;
  onSelectionChange?: (count: number) => void;
}

export default function PagesList({ 
  pages, 
  canCreate,
  viewType = "list",
  selectedCount: externalSelectedCount,
  onSelectionChange,
}: PagesListProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  
  // Update parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedPages.size);
    }
  }, [selectedPages, onSelectionChange]);

  const handleCopy = async (pageUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedId(id);
      toast.success("Page URL copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Page deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = async (pageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this page",
          text: "Custom page",
          url: pageUrl,
        });
        toast.success("Page shared");
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy(pageUrl, "share");
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPages(newSelected);
  };

  if (pages.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="No pages yet"
        description={
          canCreate
            ? "Create your first custom page to get started."
            : "Pages feature is not available on your current plan. Upgrade to Pro or higher to create custom landing pages."
        }
        action={
          canCreate ? (
            <Link href="/dashboard/pages/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Your First Page
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/billing">
              <Button>
                <Crown className="h-4 w-4" />
                Upgrade to Access Pages
              </Button>
            </Link>
          )
        }
      />
    );
  }

  // Render based on view type
  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => {
          const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;
          const isSelected = selectedPages.has(page.id);
          const createdDate = new Date(page.created_at).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          });

          return (
            <div
              key={page.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border/80 p-4 shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all",
                isSelected && "ring-2 ring-electric-sapphire"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(page.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-text mb-1 line-clamp-1">
                    {page.title}
                  </h3>
                  <p className="text-xs text-neutral-muted line-clamp-2 mb-2">
                    {page.description || pageUrl}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-muted">
                    <span>{page.view_count || 0} views</span>
                    <span>•</span>
                    <span>{page.click_count || 0} clicks</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                <span className="text-xs text-neutral-muted">{createdDate}</span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/pages/${page.id}/edit`}
                    className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
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
        {pages.map((page) => {
          const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;
          const isSelected = selectedPages.has(page.id);
          const createdDate = new Date(page.created_at).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          });

          return (
            <div
              key={page.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border/80 p-5 shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all",
                isSelected && "ring-2 ring-electric-sapphire"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(page.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-neutral-text">
                      {page.title}
                    </h3>
                    {!page.is_public && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-bg text-neutral-muted border border-neutral-border">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-muted line-clamp-2 mb-3">
                    {page.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-muted mb-3">
                    <span>{page.view_count || 0} views</span>
                    <span>{page.click_count || 0} clicks</span>
                    <span>{createdDate}</span>
                  </div>
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-electric-sapphire hover:text-bright-indigo font-semibold block truncate"
                  >
                    {pageUrl}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-border">
                <Link
                  href={`/dashboard/pages/${page.id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                >
                  Edit
                </Link>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white shadow-button hover:bg-bright-indigo transition-all"
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
    <div className="space-y-3">
      {pages.map((page) => {
        const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${page.slug}`;
        const isCopied = copiedId === page.id;
        const isSelected = selectedPages.has(page.id);
        const createdDate = new Date(page.created_at).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric", 
          year: "numeric" 
        });

        return (
          <div
            key={page.id}
            className={cn(
              "bg-white border border-neutral-border/80 rounded-card p-4 sm:p-5 shadow-soft",
              "hover:shadow-hover hover:-translate-y-0.5 transition-all",
              isSelected && "ring-2 ring-electric-sapphire"
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Checkbox */}
              <div className="pt-1 shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(page.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer"
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title and URL */}
                <div className="mb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-neutral-text break-words">
                      {page.title}
                    </h3>
                    {!page.is_public && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-bg text-neutral-muted border border-neutral-border">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2 min-w-0">
                    <a
                      href={pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-electric-sapphire hover:text-bright-indigo font-semibold truncate"
                    >
                      {pageUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(pageUrl, page.id)}
                      className={cn(
                        "p-1 rounded-lg transition-colors shrink-0",
                        isCopied
                          ? "text-blue-energy bg-blue-energy/10"
                          : "text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10"
                      )}
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {page.description && (
                    <p className="text-xs text-neutral-muted line-clamp-2">
                      {page.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-muted">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{page.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{page.click_count || 0} clicks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{createdDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>No tags</span>
                  </div>
                </div>
              </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-start">
                <Link
                  href={`/dashboard/pages/${page.id}/analytics`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Link>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <Link
                  href={`/dashboard/pages/${page.id}/edit`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleShare(pageUrl)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-blue-energy hover:bg-blue-energy/10 transition-colors"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="hidden sm:inline-flex p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* End of Pages Indicator */}
      {pages.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 text-sm text-neutral-muted">
            <div className="h-px w-12 bg-neutral-border" />
            <span>You've reached the end of your pages</span>
            <div className="h-px w-12 bg-neutral-border" />
          </div>
        </div>
      )}
    </div>
  );
}

