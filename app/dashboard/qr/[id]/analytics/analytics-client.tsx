"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Globe,
  MapPin,
  Users,
  Calendar,
  Link2,
  ExternalLink,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export function QRAnalyticsClient({
  qrCode,
  linkStats,
}: {
  qrCode: any;
  linkStats: any;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.qr_data);
      setCopied(true);
      toast.success("QR code data copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode.qr_data;
    link.download = `qr-code-${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this QR code",
          text: "QR Code",
          url: qrCode.qr_data,
        });
        toast.success("QR code shared!");
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalClicks = linkStats?.total_clicks || 0;
  const uniqueClicks = linkStats?.unique_clicks || 0;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/qr"
            className="flex items-center gap-2 text-neutral-muted hover:text-neutral-text transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to QR Codes</span>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-text">QR Code Analytics</h1>
                  <p className="text-sm text-neutral-muted mt-1">
                    Created {new Date(qrCode.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="p-4 bg-white rounded-xl border border-neutral-border">
                  <img
                    src={qrCode.qr_data}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-neutral-text mb-4">QR Code Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg border border-neutral-border">
                    <span className="text-sm font-semibold text-neutral-muted">Status</span>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                        qrCode.is_active
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          qrCode.is_active ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                      {qrCode.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  {qrCode.link_id && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg border border-neutral-border">
                      <span className="text-sm font-semibold text-neutral-muted">Linked to</span>
                      <Link2 className="h-4 w-4 text-electric-sapphire" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        copied
                          ? "bg-electric-sapphire/10 border-electric-sapphire text-electric-sapphire"
                          : "bg-white border-neutral-border text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire"
                      )}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-4 py-3 rounded-xl border border-neutral-border bg-white text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire transition-all active:scale-[0.98]"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Stats */}
        {qrCode.link_id && linkStats ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-electric-sapphire" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-muted mb-1">Total Scans</p>
                <p className="text-3xl font-bold text-neutral-text">{formatNumber(totalClicks)}</p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-neon-pink" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-muted mb-1">Unique Scans</p>
                <p className="text-3xl font-bold text-neutral-text">{formatNumber(uniqueClicks)}</p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-energy" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-muted mb-1">Top Location</p>
                <p className="text-2xl font-bold text-neutral-text">
                  {linkStats?.clicks_by_country?.[0]?.country || "N/A"}
                </p>
                {linkStats?.clicks_by_country?.[0] && (
                  <p className="text-xs text-neutral-muted mt-2">
                    {linkStats.clicks_by_country[0].count} clicks
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-vivid-royal" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-muted mb-1">Linked Link</p>
                <p className="text-lg font-bold text-neutral-text">Active</p>
              </div>
            </div>

            {/* Link to Full Analytics */}
            <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-text mb-1">
                    View Full Link Analytics
                  </h3>
                  <p className="text-sm text-neutral-muted">
                    This QR code is linked to a short link. View detailed analytics for the link.
                  </p>
                </div>
                <Link
                  href={`/dashboard/links/${qrCode.link_id}/analytics`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Analytics
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-border p-12 shadow-soft text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-6">
              <QrCode className="h-10 w-10 text-electric-sapphire/60" />
            </div>
            <h3 className="text-xl font-bold text-neutral-text mb-2">
              No Analytics Available
            </h3>
            <p className="text-sm text-neutral-muted mb-6 max-w-md mx-auto">
              This QR code is not linked to a short link. Link it to a short link to track scans and analytics.
            </p>
            <Link
              href="/dashboard/qr"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
            >
              Back to QR Codes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
