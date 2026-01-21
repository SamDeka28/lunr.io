"use client";

import { X, Download, Copy, Settings, ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  qrCode?: string;
  shortUrl?: string;
  onDownload?: () => void;
  onCopy?: () => void;
  onCustomize?: () => void;
  onViewAnalytics?: () => void;
  createAnotherText?: string;
  onCreateAnother?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  subtitle,
  qrCode,
  shortUrl,
  onDownload,
  onCopy,
  onCustomize,
  onViewAnalytics,
  createAnotherText = "On a roll? Don't stop now! Create another →",
  onCreateAnother,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "png" | "svg" | "pdf" = "png") => {
    if (onDownload) {
      onDownload();
    } else if (qrCode) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `qr-code-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`QR code downloaded as ${format.toUpperCase()}!`);
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-bg transition-colors text-neutral-muted hover:text-neutral-text z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20 rounded-full blur-xl animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-electric-sapphire to-bright-indigo shadow-premium">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-text mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-neutral-muted leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="mb-6 flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl border border-neutral-border shadow-soft mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-56 h-56"
                />
              </div>
            </div>
          )}

          {/* Short URL Display */}
          {shortUrl && !qrCode && (
            <div className="mb-6 p-4 rounded-xl bg-neutral-bg border border-neutral-border">
              <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                Your short link
              </p>
              <p className="text-sm text-electric-sapphire font-mono break-all font-semibold">
                {shortUrl}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Download Button (only if QR code exists) */}
            {qrCode && onDownload && (
              <div className="relative">
                <button
                  onClick={() => handleDownload("png")}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-3 gap-2">
              {shortUrl && (
                <button
                  onClick={handleCopy}
                  className="h-11 px-3 rounded-xl border border-neutral-border bg-white text-neutral-text text-sm font-semibold hover:bg-neutral-bg hover:border-neutral-text transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Copy className={cn("h-4 w-4", copied && "text-electric-sapphire")} />
                  <span className="text-xs">{copied ? "Copied!" : "Copy code"}</span>
                </button>
              )}
              {onCustomize && (
                <button
                  onClick={onCustomize}
                  className="h-11 px-3 rounded-xl border border-neutral-border bg-white text-neutral-text text-sm font-semibold hover:bg-neutral-bg hover:border-neutral-text transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Customize</span>
                </button>
              )}
              {onViewAnalytics && (
                <button
                  onClick={onViewAnalytics}
                  className="h-11 px-3 rounded-xl border border-neutral-border bg-white text-neutral-text text-sm font-semibold hover:bg-neutral-bg hover:border-neutral-text transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-xs">View Analytics</span>
                </button>
              )}
            </div>

            {/* Create Another */}
            {onCreateAnother && (
              <button
                onClick={onCreateAnother}
                className="w-full pt-4 mt-2 text-sm font-semibold text-electric-sapphire hover:text-bright-indigo transition-colors flex items-center justify-center gap-2 group"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  {createAnotherText.includes("→") ? createAnotherText : `${createAnotherText} →`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
