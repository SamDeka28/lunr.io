"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, QrCode, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export function QuickCreateCard({ remainingLinks, canCreateLink }: { remainingLinks: number; canCreateLink: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [createQR, setCreateQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"link" | "qr">("link");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      if (mode === "link") {
        const response = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_url: url,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create link");
        }

        const linkData = await response.json();
        
        if (createQR) {
          try {
            await fetch("/api/qr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                link_id: linkData.id,
                original_url: url,
              }),
            });
          } catch (qrError) {
            console.error("Failed to create QR code:", qrError);
          }
        }

        toast.success("Link created successfully!");
        setUrl("");
        setCreateQR(false);
        router.refresh();
      } else {
        router.push(`/dashboard/qr/new?url=${encodeURIComponent(url)}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateLink) {
    return (
      <div className="bg-white rounded-card p-8 shadow-soft border border-neutral-border">
        <div className="text-center">
          <h3 className="text-xl font-bold text-neutral-text mb-2">You've reached your free link limit</h3>
          <p className="text-sm text-neutral-muted mb-6">
            Upgrade to create unlimited links and unlock premium features.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-raspberry-plum text-white text-sm font-semibold hover:from-raspberry-plum hover:to-indigo-bloom transition-all active:scale-[0.98] shadow-button"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card p-8 shadow-soft border border-neutral-border">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-electric-sapphire" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-text">Create your short link</h1>
        </div>
        <p className="text-sm text-neutral-muted ml-13">
          You can create {remainingLinks} more {remainingLinks === 1 ? "link" : "links"} this month.{" "}
          <a href="/pricing" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
            Upgrade for unlimited →
          </a>
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-neutral-bg rounded-xl w-fit border border-neutral-border">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === "link"
              ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
              : "text-neutral-muted hover:text-neutral-text hover:bg-white"
          )}
        >
          Short link
        </button>
        <button
          type="button"
          onClick={() => setMode("qr")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === "qr"
              ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
              : "text-neutral-muted hover:text-neutral-text hover:bg-white"
          )}
        >
          QR Code
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
            Enter your destination URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/my-long-url"
              required
              className={cn(
                "flex-1 h-14 px-5 rounded-xl bg-white border-2 border-neutral-border",
                "text-neutral-text text-sm font-medium",
                "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                "transition-all"
              )}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className={cn(
                "h-14 px-8 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-bold",
                "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30",
                "transition-all active:scale-[0.98] flex items-center gap-2 shadow-button whitespace-nowrap",
                "min-w-[160px]"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {mode === "link" ? (
                    <>
                      <Link2 className="h-4 w-4" />
                      Create link
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Create QR
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {mode === "link" && (
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={createQR}
              onChange={(e) => setCreateQR(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-border text-electric-sapphire focus:ring-electric-sapphire/40 cursor-pointer"
            />
            <span className="text-sm text-neutral-muted group-hover:text-neutral-text transition-colors">
              Also create a QR code for this link
            </span>
          </label>
        )}
      </form>
    </div>
  );
}
