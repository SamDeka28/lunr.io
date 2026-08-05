"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, QrCode, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function QuickCreateCard({
  remainingLinks,
  canCreateLink,
}: {
  remainingLinks: number;
  canCreateLink: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [createQR, setCreateQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"link" | "qr" | "page">("link");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "page") {
      router.push("/dashboard/pages/new");
      return;
    }

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
      <div className="relative overflow-hidden rounded-special bg-white border border-neutral-border/80 shadow-premium p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 100% 0%, rgba(67,97,238,0.10), transparent 55%)",
          }}
        />
        <div className="relative">
          <h3 className="text-lg font-semibold text-neutral-text tracking-tight mb-1">
            Link limit reached
          </h3>
          <p className="text-sm text-neutral-muted mb-5 max-w-md leading-relaxed">
            Upgrade your plan to create more links and unlock premium features.
          </p>
          <Button onClick={() => router.push("/dashboard/billing")}>View plans</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "link" as const, label: "Short link", icon: Link2 },
    { id: "qr" as const, label: "QR code", icon: QrCode },
    { id: "page" as const, label: "Link-in-bio", icon: FileText },
  ];

  return (
    <div className="relative overflow-hidden rounded-special bg-white border border-neutral-border/80 shadow-premium">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 0% 0%, rgba(67,97,238,0.07), transparent 50%), radial-gradient(50% 60% at 100% 100%, rgba(76,201,240,0.06), transparent 45%)",
        }}
      />

      <div className="relative p-5 sm:p-7 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-text tracking-tight">
              Create something new
            </h2>
            <p className="text-sm text-neutral-muted mt-1.5 leading-relaxed">
              {remainingLinks === Infinity
                ? "Unlimited links on your plan."
                : `${remainingLinks} link${remainingLinks === 1 ? "" : "s"} remaining this period.`}{" "}
              <Link
                href="/dashboard/billing"
                className="text-primary hover:text-bright-indigo font-medium"
              >
                Manage plan
              </Link>
            </p>
          </div>

          <div className="flex p-1 bg-neutral-surface/90 rounded-full w-full sm:w-fit border border-neutral-border/80 shadow-soft">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={cn(
                    "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white text-primary shadow-soft"
                      : "text-neutral-muted hover:text-neutral-text"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "page" ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 rounded-2xl border border-neutral-border/80 bg-neutral-bg/60 px-4 py-3.5 text-sm text-neutral-muted">
                Build a branded page with multiple links in one place.
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[160px] shrink-0">
                <FileText className="h-4 w-4" />
                Open studio
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-medium text-neutral-muted">
                  Destination URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/your-long-url"
                    required
                    className={cn(
                      "flex-1 h-12 px-4 rounded-2xl bg-neutral-bg/70 border border-neutral-border/80",
                      "text-neutral-text text-sm min-w-0 shadow-soft",
                      "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white",
                      "placeholder:text-neutral-muted/80 transition-all duration-200"
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading || !url}
                    className="w-full sm:w-auto sm:min-w-[160px] shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : mode === "link" ? (
                      <>
                        <Link2 className="h-4 w-4" />
                        Shorten
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Create QR
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {mode === "link" && (
                <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                  <input
                    type="checkbox"
                    checked={createQR}
                    onChange={(e) => setCreateQR(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-muted group-hover:text-neutral-text transition-colors">
                    Also create a QR code
                  </span>
                </label>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
