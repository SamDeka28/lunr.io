"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Server,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { buildInstallSnippets } from "@/lib/utils/conversion-snippets";

type InstallMethod = "capture" | "thank_you" | "image" | "postback";

const EVENT_PRESETS = ["purchase", "signup", "lead", "subscribe", "custom"] as const;

const INSTALL_METHODS: {
  id: InstallMethod;
  label: string;
  hint: string;
  icon: typeof Monitor;
}[] = [
  {
    id: "capture",
    label: "Landing capture",
    hint: "Save lunr_sc before checkout drops query params",
    icon: Monitor,
  },
  {
    id: "thank_you",
    label: "Thank-you JS",
    hint: "Best for most sites — fires the pixel with attribution",
    icon: Sparkles,
  },
  {
    id: "image",
    label: "Image pixel",
    hint: "No JavaScript — use an img tag",
    icon: ImageIcon,
  },
  {
    id: "postback",
    label: "Server postback",
    hint: "Call from your order backend (most reliable)",
    icon: Server,
  },
];

type TrackingPayload = {
  configured: boolean;
  user_id: string;
  campaign_id: string;
  token: string | null;
  base_url: string;
  capture_snippet: string;
};

export function PixelStudio({
  campaignId,
  currency,
  onLogged,
}: {
  campaignId: string;
  currency: string;
  onLogged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);
  const [method, setMethod] = useState<InstallMethod>("thank_you");
  const [eventPreset, setEventPreset] = useState<(typeof EVENT_PRESETS)[number]>("purchase");
  const [customEvent, setCustomEvent] = useState("");
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const [testEvent, setTestEvent] = useState("purchase");
  const [testValue, setTestValue] = useState("");
  const [testShortCode, setTestShortCode] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/tracking`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load Pixel Studio");
        if (!cancelled) setTracking(json);
      } catch (err: any) {
        if (!cancelled) toast.error(err.message || "Failed to load Pixel Studio");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const eventName =
    eventPreset === "custom"
      ? customEvent.trim() || "conversion"
      : eventPreset;

  const snippets = useMemo(() => {
    if (!tracking?.configured || !tracking.token) return null;
    return buildInstallSnippets({
      baseUrl: tracking.base_url,
      userId: tracking.user_id,
      campaignId: tracking.campaign_id,
      token: tracking.token,
      eventName,
      value,
      currency,
    });
  }, [tracking, eventName, value, currency]);

  const activeCode = useMemo(() => {
    if (!snippets && method !== "capture") return "";
    if (method === "capture") {
      return tracking?.capture_snippet || snippets?.capture_snippet || "";
    }
    if (!snippets) return "";
    if (method === "thank_you") return snippets.thank_you_snippet || "";
    if (method === "image") return snippets.pixel_img || "";
    return snippets.postback_example || "";
  }, [method, snippets, tracking]);

  const copy = async () => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  };

  const fireTest = async () => {
    setTesting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/conversions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: testEvent.trim() || "conversion",
          value: testValue !== "" ? Number(testValue) : undefined,
          currency,
          short_code: testShortCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log conversion");
      toast.success("Test conversion recorded");
      onLogged?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to log conversion");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-neutral-text tracking-tight">
              Pixel Studio
            </h2>
          </div>
          <p className="text-sm text-neutral-muted mt-1.5 max-w-2xl leading-relaxed">
            Pick an event, copy a snippet for your thank-you page (or postback), then confirm
            with a test fire. Analytics stays the scoreboard.
          </p>
        </div>
        <a
          href="/docs/campaigns/conversion-tracking"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-muted hover:text-primary"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Pixel guide
        </a>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-muted py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading Pixel Studio…
        </div>
      )}

      {!loading && tracking && !tracking.configured && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Set <code className="text-xs bg-white/70 px-1 rounded">CONVERSION_TRACK_SECRET</code>{" "}
          in your environment and restart the app to unlock install snippets.
        </div>
      )}

      {!loading && tracking && (
        <div className="rounded-2xl border border-neutral-border/80 bg-white shadow-soft overflow-hidden">
          <div className="grid lg:grid-cols-[240px_1fr] min-h-[420px]">
            {/* Left rail */}
            <aside className="border-b lg:border-b-0 lg:border-r border-neutral-border/70 bg-neutral-bg/40 p-4 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-2">
                  Event
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEventPreset(preset)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors capitalize",
                        eventPreset === preset
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-neutral-muted border-neutral-border/80 hover:text-neutral-text"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {eventPreset === "custom" && (
                  <input
                    value={customEvent}
                    onChange={(e) => setCustomEvent(e.target.value)}
                    placeholder="event_name"
                    className="mt-2 w-full h-9 px-3 rounded-xl border border-neutral-border/80 text-sm bg-white"
                  />
                )}
                <label className="block mt-3">
                  <span className="text-[11px] font-semibold text-neutral-muted">
                    Default value (optional)
                  </span>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="49.99"
                    inputMode="decimal"
                    className="mt-1 w-full h-9 px-3 rounded-xl border border-neutral-border/80 text-sm bg-white"
                  />
                </label>
                <p className="text-[10px] text-neutral-muted mt-1.5">
                  Currency: {currency}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-2">
                  Install method
                </p>
                <div className="space-y-1">
                  {INSTALL_METHODS.map((m) => {
                    const Icon = m.icon;
                    const disabled =
                      m.id !== "capture" && !tracking.configured;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-xl border transition-colors",
                          method === m.id
                            ? "bg-white border-primary/40 shadow-soft"
                            : "bg-transparent border-transparent hover:bg-white/70",
                          disabled && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5",
                              method === m.id ? "text-primary" : "text-neutral-muted"
                            )}
                          />
                          <span className="text-xs font-semibold text-neutral-text">
                            {m.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-muted mt-0.5 pl-5 leading-snug">
                          {m.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="p-5 space-y-5">
              <FlowStrip eventName={eventName} />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-text">
                      {INSTALL_METHODS.find((m) => m.id === method)?.label}
                    </p>
                    <p className="text-xs text-neutral-muted">
                      {INSTALL_METHODS.find((m) => m.id === method)?.hint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copy}
                    disabled={!activeCode}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary text-white text-xs font-semibold disabled:opacity-40"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy snippet"}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed bg-neutral-bg/80 border border-neutral-border/70 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap break-all font-mono text-neutral-text min-h-[96px]">
                  {activeCode ||
                    (tracking.configured
                      ? "—"
                      : "Configure CONVERSION_TRACK_SECRET to generate install code.")}
                </pre>
              </div>

              <div className="rounded-xl border border-neutral-border/70 bg-neutral-bg/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-neutral-text">
                    Test fire
                  </p>
                </div>
                <p className="text-xs text-neutral-muted">
                  Record a conversion now to verify Analytics and CPA without waiting
                  for a real checkout.
                </p>
                <div className="grid sm:grid-cols-3 gap-2">
                  <input
                    value={testEvent}
                    onChange={(e) => setTestEvent(e.target.value)}
                    placeholder="Event"
                    className="h-10 px-3 rounded-xl border border-neutral-border/80 text-sm bg-white"
                  />
                  <input
                    value={testValue}
                    onChange={(e) => setTestValue(e.target.value)}
                    placeholder="Value"
                    inputMode="decimal"
                    className="h-10 px-3 rounded-xl border border-neutral-border/80 text-sm bg-white"
                  />
                  <input
                    value={testShortCode}
                    onChange={(e) => setTestShortCode(e.target.value)}
                    placeholder="Short code (optional)"
                    className="h-10 px-3 rounded-xl border border-neutral-border/80 text-sm bg-white"
                  />
                </div>
                <button
                  type="button"
                  disabled={testing}
                  onClick={fireTest}
                  className="h-10 px-4 rounded-full border border-neutral-border text-sm font-semibold text-neutral-text hover:bg-white disabled:opacity-40"
                >
                  {testing ? "Recording…" : "Log test conversion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowStrip({ eventName }: { eventName: string }) {
  const steps = [
    "Short link click",
    "lunr_sc on landing",
    "Thank-you / backend",
    `${eventName} → Analytics`,
  ];
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[0.03] px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted mb-2">
        How it flows
      </p>
      <ol className="flex flex-wrap items-center gap-1.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-border/70 px-2.5 py-1 text-[11px] font-medium text-neutral-text">
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold inline-flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="text-neutral-border text-xs">→</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
