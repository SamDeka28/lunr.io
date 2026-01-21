"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Download, Trash2, ExternalLink, Copy, Check, Share2, MoreVertical, Calendar, Tag, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { toast } from "sonner";

interface QRCodeListProps {
  qrCodes: any[];
  canCreate: boolean;
  viewType?: "list" | "grid" | "card";
  onSelectionChange?: (count: number) => void;
}

export default function QRCodeList({ qrCodes, canCreate, viewType = "list", onSelectionChange }: QRCodeListProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQRCodes, setSelectedQRCodes] = useState<Set<string>>(new Set());

  // Update parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedQRCodes.size);
    }
  }, [selectedQRCodes, onSelectionChange]);

  // Memoize processed QR codes to avoid recalculating on every render
  const processedQRCodes = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    return qrCodes.map((qr) => {
      const shortUrl = qr.links 
        ? `${baseUrl}/${qr.links.short_code}`
        : null;
      const createdDate = new Date(qr.created_at).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
      
      return {
        ...qr,
        shortUrl,
        createdDate,
      };
    });
  }, [qrCodes]);

  const handleCopy = async (qrDataUrl: string, id: string) => {
    try {
      // Convert data URL to blob and copy
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedId(id);
      toast.success("QR code copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = async (qrDataUrl: string, id: string, shortCode?: string) => {
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${shortCode || id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("QR code deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleShare = async (qrDataUrl: string) => {
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "qr-code.png", { type: blob.type });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "QR Code",
          files: [file],
        });
        toast.success("QR code shared");
      } else {
        // Fallback to copy
        handleCopy(qrDataUrl, "share");
      }
    } catch (err) {
      // User cancelled or error
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedQRCodes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQRCodes(newSelected);
  };

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-card shadow-soft border border-neutral-border">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-6">
          <QrCode className="h-12 w-12 text-electric-sapphire/60" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-text mb-3">
          No QR codes yet
        </h3>
        <p className="text-sm text-neutral-muted mb-8 max-w-sm mx-auto">
          {canCreate
            ? "Generate your first QR code to get started."
            : "You've reached your free QR code limit. Upgrade for more."}
        </p>
        {canCreate && (
          <Link
            href="/dashboard/qr/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
          >
            <span className="text-lg">+</span>
            Generate Your First QR Code
          </Link>
        )}
      </div>
    );
  }

  // Render based on view type
  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedQRCodes.map((qr) => {
          const isSelected = selectedQRCodes.has(qr.id);

          return (
            <div
              key={qr.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border p-4 hover:shadow-soft transition-all",
                isSelected && "ring-2 ring-electric-sapphire"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(qr.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-neutral-bg to-white p-2 border border-neutral-border flex items-center justify-center mb-2 mx-auto">
                    <img 
                      src={qr.qr_data} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {qr.shortUrl && (
                    <p className="text-xs text-neutral-muted font-mono text-center truncate mb-2">
                      {qr.shortUrl}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3 text-xs text-neutral-muted">
                    <span>{qr.createdDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                <button
                  onClick={() => handleDownload(qr.qr_data, qr.id, qr.links?.short_code)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                >
                  Download
                </button>
                <Link
                  href={`/dashboard/qr/${qr.id}/analytics`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal transition-all"
                >
                  Analytics
                </Link>
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
        {processedQRCodes.map((qr) => {
          const isSelected = selectedQRCodes.has(qr.id);

          return (
            <div
              key={qr.id}
              className={cn(
                "bg-white rounded-card border border-neutral-border p-5 hover:shadow-soft transition-all",
                isSelected && "ring-2 ring-electric-sapphire"
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(qr.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer mt-1"
                />
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-neutral-bg to-white p-3 border-2 border-neutral-border flex items-center justify-center flex-shrink-0">
                  <img 
                    src={qr.qr_data} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {qr.shortUrl && (
                    <div className="mb-2">
                      <Link
                        href={qr.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-electric-sapphire hover:text-bright-indigo font-semibold block truncate"
                      >
                        {qr.shortUrl}
                      </Link>
                    </div>
                  )}
                  {qr.links && (
                    <p className="text-xs text-neutral-muted truncate mb-3">
                      {qr.links.original_url}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-neutral-muted">
                    <span>{qr.createdDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-border">
                <button
                  onClick={() => handleDownload(qr.qr_data, qr.id, qr.links?.short_code)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                >
                  Download
                </button>
                <Link
                  href={`/dashboard/qr/${qr.id}/analytics`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal transition-all"
                >
                  View Analytics
                </Link>
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
      {processedQRCodes.map((qr, index) => {
        const isCopied = copiedId === qr.id;
        const isSelected = selectedQRCodes.has(qr.id);

        return (
          <div
            key={qr.id}
            className={cn(
              "bg-white border-b border-neutral-border p-5",
              "hover:bg-neutral-bg transition-colors",
              index === 0 && "rounded-t-card border-t",
              index === processedQRCodes.length - 1 && "rounded-b-card border-b"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(qr.id)}
                  className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer"
                />
              </div>

              {/* QR Code Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-neutral-bg to-white p-3 border-2 border-neutral-border flex items-center justify-center">
                  <img 
                    src={qr.qr_data} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Link */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-neutral-text">
                      {qr.shortUrl ? (
                        <Link
                          href={qr.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-electric-sapphire hover:text-bright-indigo font-semibold"
                        >
                          {qr.shortUrl}
                        </Link>
                      ) : (
                        "QR Code"
                      )}
                    </h3>
                    {qr.shortUrl && (
                      <button
                        onClick={() => handleCopy(qr.shortUrl!, qr.id)}
                        className={cn(
                          "p-1 rounded-lg transition-colors",
                          isCopied
                            ? "text-blue-energy bg-blue-energy/10"
                            : "text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10"
                        )}
                        title="Copy link"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {qr.links && (
                    <div className="flex items-center gap-2">
                      <a
                        href={qr.links.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-muted hover:text-neutral-text flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="truncate max-w-md">{qr.links.original_url}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-neutral-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{qr.createdDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>No tags</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/dashboard/qr/${qr.id}/analytics`}
                  className="p-2 rounded-xl text-neutral-muted hover:text-bright-indigo hover:bg-bright-indigo/10 transition-colors"
                  title="Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDownload(qr.qr_data, qr.id, qr.links?.short_code)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare(qr.qr_data)}
                  className="p-2 rounded-xl text-neutral-muted hover:text-blue-energy hover:bg-blue-energy/10 transition-colors"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(qr.id)}
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

      {/* End of QR Codes Indicator */}
      {processedQRCodes.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-3 text-sm text-neutral-muted">
            <div className="h-px w-12 bg-neutral-border" />
            <span>You've reached the end of your QR codes</span>
            <div className="h-px w-12 bg-neutral-border" />
          </div>
        </div>
      )}
    </div>
  );
}

