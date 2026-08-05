"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Check,
  X,
  Crown,
  Loader2,
  ExternalLink,
  BookOpen,
  Shield,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
}

interface WebhooksProps {
  userId: string;
  hasApiAccess: boolean;
}

const availableEvents = [
  { value: "link.created", label: "Link Created", category: "Links" },
  { value: "link.updated", label: "Link Updated", category: "Links" },
  { value: "link.deleted", label: "Link Deleted", category: "Links" },
  { value: "link.clicked", label: "Link Clicked", category: "Links" },
  { value: "qr.created", label: "QR Code Created", category: "QR Codes" },
  { value: "qr.updated", label: "QR Code Updated", category: "QR Codes" },
  { value: "qr.deleted", label: "QR Code Deleted", category: "QR Codes" },
  { value: "page.created", label: "Page Created", category: "Pages" },
  { value: "page.updated", label: "Page Updated", category: "Pages" },
  { value: "page.deleted", label: "Page Deleted", category: "Pages" },
  { value: "campaign.created", label: "Campaign Created", category: "Campaigns" },
  { value: "campaign.updated", label: "Campaign Updated", category: "Campaigns" },
  { value: "campaign.deleted", label: "Campaign Deleted", category: "Campaigns" },
  { value: "analytics.spike", label: "Traffic Spike", category: "Analytics" },
];

const inputClass = cn(
  "w-full h-11 px-4 rounded-2xl border border-neutral-border/80 bg-white",
  "text-sm text-neutral-text shadow-soft",
  "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary",
  "placeholder:text-neutral-muted/80 transition-all"
);

export function Webhooks({ userId, hasApiAccess }: WebhooksProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [showNewSecret, setShowNewSecret] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  useEffect(() => {
    if (hasApiAccess) {
      fetchWebhooks();
    } else {
      setLoading(false);
    }
  }, [hasApiAccess, userId]);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks");
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newWebhookName.trim()) {
      toast.error("Please enter a name for the webhook");
      return;
    }
    if (!newWebhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWebhookName,
          url: newWebhookUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewWebhookSecret(data.secret);
        setShowNewSecret(true);
        setNewWebhookName("");
        setNewWebhookUrl("");
        setSelectedEvents([]);
        await fetchWebhooks();
        toast.success("Webhook created successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create webhook");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleToggleActive = async (webhookId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        await fetchWebhooks();
        toast.success(`Webhook ${!currentStatus ? "activated" : "deactivated"}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update webhook");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update webhook");
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchWebhooks();
        toast.success("Webhook deleted");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete webhook");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete webhook");
    }
  };

  const toggleEvent = (eventValue: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventValue)
        ? prev.filter((e) => e !== eventValue)
        : [...prev, eventValue]
    );
  };

  const toggleCategoryEvents = (category: string) => {
    const categoryEvents = availableEvents
      .filter((e) => e.category === category)
      .map((e) => e.value);
    const allSelected = categoryEvents.every((v) => selectedEvents.includes(v));
    if (allSelected) {
      setSelectedEvents((prev) => prev.filter((e) => !categoryEvents.includes(e)));
    } else {
      setSelectedEvents((prev) => {
        const next = [...prev];
        categoryEvents.forEach((v) => {
          if (!next.includes(v)) next.push(v);
        });
        return next;
      });
    }
  };

  const toggleAllEvents = () => {
    const all = availableEvents.map((e) => e.value);
    const allSelected = all.every((v) => selectedEvents.includes(v));
    setSelectedEvents(allSelected ? [] : all);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!hasApiAccess) {
    return (
      <div className="relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "radial-gradient(80% 100% at 0% 0%, rgba(67,97,238,0.06), transparent 60%)",
          }}
        />
        <div className="relative p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Crown className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-text tracking-tight mb-2">
            API access required
          </h2>
          <p className="text-sm text-neutral-muted mb-5 max-w-md mx-auto leading-relaxed">
            Webhooks are available on Enterprise plans. Upgrade to receive real-time event
            notifications.
          </p>
          <Link href="/dashboard/billing">
            <Button>View plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "radial-gradient(80% 100% at 0% 0%, rgba(67,97,238,0.06), transparent 60%)",
        }}
      />
      <div className="relative p-5 sm:p-7 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Radio className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-text tracking-tight">Webhooks</h2>
              <p className="text-sm text-neutral-muted mt-0.5 leading-relaxed">
                Get real-time POST notifications when events happen
              </p>
            </div>
          </div>
          <Link
            href="/api-reference"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-bright-indigo"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Setup guide
          </Link>
        </div>

        {showNewSecret && newWebhookSecret && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                  Copy your webhook secret
                </h3>
                <p className="text-xs text-emerald-800/80 mb-3 leading-relaxed">
                  Use this to verify signatures. It won’t be shown again.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-xs sm:text-sm text-neutral-text break-all shadow-soft">
                    {newWebhookSecret}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(newWebhookSecret, "Webhook secret")}
                    className="shrink-0 !bg-emerald-600 hover:!bg-emerald-700 !shadow-none"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewSecret(false);
                  setNewWebhookSecret(null);
                }}
                className="p-1.5 rounded-full text-emerald-700/70 hover:bg-emerald-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Radio className="h-4 w-4" />
          </div>
          <p className="text-xs text-neutral-muted leading-relaxed">
            Instead of polling the API, your server receives POST requests when links, QR codes,
            pages, or campaigns change.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-border/80 bg-neutral-bg/50 p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-text tracking-tight flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Create webhook
          </h3>

          <div>
            <label className="block text-[13px] font-medium text-neutral-muted mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Production webhook"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
              className={inputClass}
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-muted mb-2">
              Endpoint URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://your-server.com/webhooks"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className={cn(inputClass, "font-mono")}
              disabled={creating}
            />
            <p className="text-xs text-neutral-muted mt-1.5">Must use HTTPS.</p>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-muted mb-2">
              Events <span className="text-red-500">*</span>
            </label>

            {selectedEvents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-2xl bg-white border border-neutral-border/80 shadow-soft min-h-[3rem]">
                {selectedEvents.map((eventValue) => {
                  const event = availableEvents.find((e) => e.value === eventValue);
                  return (
                    <span
                      key={eventValue}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/15"
                    >
                      {event?.label || eventValue}
                      <button
                        type="button"
                        onClick={() => toggleEvent(eventValue)}
                        className="hover:bg-primary/15 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <div
                className={cn(
                  "flex items-center gap-2 h-11 px-4 rounded-2xl border bg-white cursor-text shadow-soft transition-all",
                  showEventDropdown
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-neutral-border/80 hover:border-primary/30"
                )}
                onClick={() => setShowEventDropdown(true)}
              >
                <Search className="h-4 w-4 text-neutral-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search events…"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  onFocus={() => setShowEventDropdown(true)}
                  className="flex-1 text-sm text-neutral-text placeholder:text-neutral-muted outline-none bg-transparent"
                />
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-muted transition-transform shrink-0",
                    showEventDropdown && "rotate-180"
                  )}
                />
              </div>

              {showEventDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowEventDropdown(false);
                      setEventSearchQuery("");
                    }}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border border-neutral-border/80 rounded-2xl shadow-float max-h-64 overflow-y-auto">
                    {(() => {
                      const filteredCategories = ["Links", "QR Codes", "Pages", "Campaigns"]
                        .map((category) => {
                          const events = availableEvents
                            .filter((e) => e.category === category)
                            .filter((e) => {
                              const q = eventSearchQuery.toLowerCase();
                              return (
                                !q ||
                                e.label.toLowerCase().includes(q) ||
                                e.value.toLowerCase().includes(q) ||
                                category.toLowerCase().includes(q)
                              );
                            });
                          if (events.length === 0) return null;
                          return { category, events };
                        })
                        .filter(Boolean) as Array<{
                        category: string;
                        events: typeof availableEvents;
                      }>;

                      if (filteredCategories.length === 0) {
                        return (
                          <div className="p-4 text-center text-sm text-neutral-muted">
                            No events match “{eventSearchQuery}”
                          </div>
                        );
                      }

                      const allValues = availableEvents.map((e) => e.value);
                      const allSelected = allValues.every((v) => selectedEvents.includes(v));

                      return (
                        <>
                          {!eventSearchQuery && (
                            <div className="p-2 border-b border-neutral-border/70">
                              <button
                                type="button"
                                onClick={toggleAllEvents}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                              >
                                <span
                                  className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                    allSelected
                                      ? "bg-primary border-primary"
                                      : "border-neutral-border"
                                  )}
                                >
                                  {allSelected && <Check className="h-3 w-3 text-white" />}
                                </span>
                                Select all events
                              </button>
                            </div>
                          )}
                          {filteredCategories.map(({ category, events }) => {
                            const values = events.map((e) => e.value);
                            const allCat = values.every((v) => selectedEvents.includes(v));
                            return (
                              <div key={category} className="p-2">
                                <div className="flex items-center justify-between px-2.5 py-1.5">
                                  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted">
                                    {category}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleCategoryEvents(category)}
                                    className="text-xs text-primary font-medium hover:underline"
                                  >
                                    {allCat ? "Deselect" : "Select all"}
                                  </button>
                                </div>
                                <div className="space-y-0.5">
                                  {events.map((event) => {
                                    const selected = selectedEvents.includes(event.value);
                                    return (
                                      <button
                                        key={event.value}
                                        type="button"
                                        onClick={() => {
                                          toggleEvent(event.value);
                                          setEventSearchQuery("");
                                        }}
                                        className={cn(
                                          "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left text-sm transition-colors",
                                          selected
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-neutral-bg text-neutral-text"
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                            selected
                                              ? "bg-primary border-primary"
                                              : "border-neutral-border"
                                          )}
                                        >
                                          {selected && <Check className="h-3 w-3 text-white" />}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                          <span className="block font-medium">{event.label}</span>
                                          <span className="block text-[11px] text-neutral-muted font-mono truncate">
                                            {event.value}
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-muted mt-2">
              {selectedEvents.length === 0
                ? "Select at least one event"
                : `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"} selected`}
            </p>
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              creating ||
              !newWebhookName.trim() ||
              !newWebhookUrl.trim() ||
              selectedEvents.length === 0
            }
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create webhook
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-border/80 bg-neutral-bg/30 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Radio className="h-5 w-5" />
            </div>
            <p className="text-sm text-neutral-muted">No webhooks yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-muted px-0.5">
              Your webhooks ({webhooks.length})
            </h3>
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className={cn(
                  "rounded-2xl border border-neutral-border/80 bg-white p-4 sm:p-5 shadow-soft transition-all hover:shadow-hover",
                  !webhook.is_active && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-text tracking-tight">
                        {webhook.name}
                      </h4>
                      <Badge variant={webhook.is_active ? "success" : "default"}>
                        {webhook.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-neutral-muted mt-0.5 shrink-0" />
                      <code className="text-xs font-mono text-neutral-text break-all">
                        {webhook.url}
                      </code>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-mono border border-primary/10"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Last triggered: {formatDate(webhook.last_triggered_at)}
                      </span>
                      {webhook.failure_count > 0 && (
                        <Badge variant="danger">
                          {webhook.failure_count} failure
                          {webhook.failure_count === 1 ? "" : "s"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                      className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface transition-colors"
                      title={webhook.is_active ? "Deactivate" : "Activate"}
                    >
                      {webhook.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 rounded-xl text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-border/80 bg-neutral-bg/50 p-4 sm:p-5">
          <h4 className="text-sm font-semibold text-neutral-text tracking-tight mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Security tips
          </h4>
          <ul className="text-xs text-neutral-muted space-y-1.5 list-disc ml-4 leading-relaxed">
            <li>Always use HTTPS endpoints</li>
            <li>Verify webhook signatures with your secret</li>
            <li>Respond with 2xx within a few seconds</li>
            <li>Handle duplicate deliveries idempotently</li>
          </ul>
          <p className="text-xs text-neutral-muted mt-3 leading-relaxed">
            Need examples? See the{" "}
            <Link href="/api-reference" className="text-primary font-semibold hover:underline">
              webhook setup guide
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
