"use client";

import { useState, useEffect } from "react";
import { Radio, Plus, Copy, Trash2, Eye, EyeOff, Calendar, Clock, Check, X, Crown, Loader2, ExternalLink, BookOpen, Shield, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";

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

  const availableEvents = [
    // Link events
    { value: "link.created", label: "Link Created", category: "Links" },
    { value: "link.updated", label: "Link Updated", category: "Links" },
    { value: "link.deleted", label: "Link Deleted", category: "Links" },
    { value: "link.clicked", label: "Link Clicked", category: "Links" },
    // QR Code events
    { value: "qr.created", label: "QR Code Created", category: "QR Codes" },
    { value: "qr.updated", label: "QR Code Updated", category: "QR Codes" },
    { value: "qr.deleted", label: "QR Code Deleted", category: "QR Codes" },
    // Page events
    { value: "page.created", label: "Page Created", category: "Pages" },
    { value: "page.updated", label: "Page Updated", category: "Pages" },
    { value: "page.deleted", label: "Page Deleted", category: "Pages" },
    // Campaign events
    { value: "campaign.created", label: "Campaign Created", category: "Campaigns" },
    { value: "campaign.updated", label: "Campaign Updated", category: "Campaigns" },
    { value: "campaign.deleted", label: "Campaign Deleted", category: "Campaigns" },
  ];

  useEffect(() => {
    if (hasApiAccess) {
      fetchWebhooks();
    }
  }, [hasApiAccess, userId]);

  const fetchWebhooks = async () => {
    try {
      // We need to use the API endpoint, but we need an API key
      // For now, let's create a direct API endpoint for dashboard use
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
    
    const allSelected = categoryEvents.every((eventValue) => selectedEvents.includes(eventValue));
    
    if (allSelected) {
      // Deselect all events in this category
      setSelectedEvents((prev) => prev.filter((e) => !categoryEvents.includes(e)));
    } else {
      // Select all events in this category
      setSelectedEvents((prev) => {
        const newEvents = [...prev];
        categoryEvents.forEach((eventValue) => {
          if (!newEvents.includes(eventValue)) {
            newEvents.push(eventValue);
          }
        });
        return newEvents;
      });
    }
  };

  const toggleAllEvents = () => {
    const allEventValues = availableEvents.map((e) => e.value);
    const allSelected = allEventValues.every((eventValue) => selectedEvents.includes(eventValue));
    
    if (allSelected) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(allEventValues);
    }
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
      <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
            <Radio className="h-5 w-5 text-electric-sapphire" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-text">Webhooks</h2>
        </div>
        <div className="text-center py-8">
          <Crown className="h-12 w-12 text-neon-pink mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-text mb-2">API Access Required</h3>
          <p className="text-sm text-neutral-muted mb-4">
            Webhooks are available on Enterprise plans. Upgrade to create and manage webhooks for real-time notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
            <Radio className="h-5 w-5 text-electric-sapphire" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-text">Webhooks</h2>
            <p className="text-sm text-neutral-muted mt-1">Receive real-time notifications when events occur</p>
          </div>
        </div>
        <Link
          href="/api-reference"
          className="text-xs text-electric-sapphire hover:underline font-medium flex items-center gap-1"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Setup Guide
        </Link>
      </div>

      {/* New Webhook Secret Display */}
      {showNewSecret && newWebhookSecret && (
        <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3 mb-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Webhook Created</h3>
              <p className="text-sm text-green-700 mb-3">
                Make sure to copy your webhook secret now. You won't be able to see it again! Use this secret to verify webhook signatures.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg font-mono text-sm text-neutral-text">
                  {newWebhookSecret}
                </code>
                <button
                  onClick={() => handleCopy(newWebhookSecret, "Webhook secret")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewSecret(false);
                setNewWebhookSecret(null);
              }}
              className="text-green-600 hover:text-green-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="mb-6 p-4 bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 rounded-xl border border-electric-sapphire/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric-sapphire/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Radio className="h-4 w-4 text-electric-sapphire" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-text mb-1">What are Webhooks?</h3>
            <p className="text-xs text-neutral-muted leading-relaxed">
              Webhooks allow you to receive real-time notifications when events occur in your account. Instead of polling the API, 
              your server will automatically receive POST requests when links are created, updated, deleted, or clicked.
            </p>
          </div>
        </div>
      </div>

      {/* Create New Webhook */}
      <div className="mb-6 p-6 bg-gradient-to-br from-neutral-bg to-neutral-bg/50 rounded-xl border border-neutral-border">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-electric-sapphire" />
          <h3 className="text-base font-semibold text-neutral-text">Create New Webhook</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-text mb-2">
              Webhook Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Production Webhook, Development Webhook"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-border bg-white text-sm font-medium text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
              disabled={creating}
            />
            <p className="text-xs text-neutral-muted mt-1.5">A descriptive name to identify this webhook</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-text mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://your-server.com/webhooks"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-border bg-white text-sm font-medium text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire font-mono"
              disabled={creating}
            />
            <p className="text-xs text-neutral-muted mt-1.5">Your server endpoint that will receive webhook events. Must use HTTPS.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-text mb-2">
              Events to Subscribe <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Events Tags */}
            {selectedEvents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-neutral-bg rounded-lg border border-neutral-border min-h-[3rem]">
                {selectedEvents.map((eventValue) => {
                  const event = availableEvents.find((e) => e.value === eventValue);
                  return (
                    <span
                      key={eventValue}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-electric-sapphire/10 text-electric-sapphire rounded-lg text-xs font-medium border border-electric-sapphire/20"
                    >
                      <span>{event?.label || eventValue}</span>
                      <button
                        type="button"
                        onClick={() => toggleEvent(eventValue)}
                        className="hover:bg-electric-sapphire/20 rounded p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Searchable Event Selector */}
            <div className="relative">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white cursor-text transition-all",
                  showEventDropdown
                    ? "border-electric-sapphire ring-2 ring-electric-sapphire/20"
                    : "border-neutral-border hover:border-electric-sapphire/50"
                )}
                onClick={() => setShowEventDropdown(true)}
              >
                <Search className="h-4 w-4 text-neutral-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search events (e.g., 'link', 'qr', 'page', 'campaign')..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  onFocus={() => setShowEventDropdown(true)}
                  className="flex-1 text-sm text-neutral-text placeholder:text-neutral-muted outline-none bg-transparent"
                />
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-muted transition-transform flex-shrink-0",
                    showEventDropdown && "transform rotate-180"
                  )}
                />
              </div>

              {/* Dropdown */}
              {showEventDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowEventDropdown(false);
                      setEventSearchQuery("");
                    }}
                  />
                  <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {(() => {
                      const filteredCategories = ["Links", "QR Codes", "Pages", "Campaigns"]
                        .map((category) => {
                          const categoryEvents = availableEvents
                            .filter((e) => e.category === category)
                            .filter((e) => {
                              const query = eventSearchQuery.toLowerCase();
                              return (
                                !query ||
                                e.label.toLowerCase().includes(query) ||
                                e.value.toLowerCase().includes(query) ||
                                category.toLowerCase().includes(query)
                              );
                            });

                          if (categoryEvents.length === 0) return null;

                          return { category, events: categoryEvents };
                        })
                        .filter((item): item is { category: string; events: typeof availableEvents } => item !== null);

                      if (filteredCategories.length === 0) {
                        return (
                          <div className="p-4 text-center text-sm text-neutral-muted">
                            No events found matching &quot;{eventSearchQuery}&quot;
                          </div>
                        );
                      }

                      const allEventValues = availableEvents.map((e) => e.value);
                      const allSelected = allEventValues.every((eventValue) => selectedEvents.includes(eventValue));

                      return (
                        <>
                          {/* Global Select All */}
                          {!eventSearchQuery && (
                            <div className="p-2 border-b border-neutral-border">
                              <button
                                type="button"
                                onClick={toggleAllEvents}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm font-medium transition-colors hover:bg-neutral-bg text-electric-sapphire"
                              >
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                                    allSelected
                                      ? "bg-electric-sapphire border-electric-sapphire"
                                      : "border-neutral-border"
                                  )}
                                >
                                  {allSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <span>Select All Events</span>
                              </button>
                            </div>
                          )}

                          {/* Category Groups */}
                          {filteredCategories.map(({ category, events: categoryEvents }) => {
                            const categoryEventValues = categoryEvents.map((e) => e.value);
                            const allCategorySelected = categoryEventValues.every((eventValue) =>
                              selectedEvents.includes(eventValue)
                            );

                            return (
                              <div key={category} className="p-2">
                                <div className="flex items-center justify-between px-2 py-1.5">
                                  <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wide">
                                    {category}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleCategoryEvents(category)}
                                    className="text-xs text-electric-sapphire hover:underline font-medium"
                                  >
                                    {allCategorySelected ? "Deselect All" : "Select All"}
                                  </button>
                                </div>
                                <div className="space-y-0.5">
                                  {categoryEvents.map((event) => {
                                    const isSelected = selectedEvents.includes(event.value);
                                    return (
                                      <button
                                        key={event.value}
                                        type="button"
                                        onClick={() => {
                                          toggleEvent(event.value);
                                          setEventSearchQuery("");
                                        }}
                                        className={cn(
                                          "w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm transition-colors",
                                          isSelected
                                            ? "bg-electric-sapphire/10 text-electric-sapphire"
                                            : "hover:bg-neutral-bg text-neutral-text"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                                            isSelected
                                              ? "bg-electric-sapphire border-electric-sapphire"
                                              : "border-neutral-border"
                                          )}
                                        >
                                          {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium">{event.label}</div>
                                          <div className="text-xs text-neutral-muted font-mono truncate">{event.value}</div>
                                        </div>
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
                ? "Select at least one event type to receive notifications for"
                : `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"} selected`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newWebhookName.trim() || !newWebhookUrl.trim() || selectedEvents.length === 0}
            className={cn(
              "w-full px-5 py-3 rounded-lg font-semibold text-sm transition-all",
              "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white",
              "hover:from-bright-indigo hover:to-vivid-royal",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2 shadow-button"
            )}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Webhook...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Webhook
              </>
            )}
          </button>
        </div>
      </div>

      {/* Webhooks List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 text-neutral-muted mx-auto animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-8">
          <Radio className="h-12 w-12 text-neutral-muted mx-auto mb-4" />
          <p className="text-neutral-muted">No webhooks yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-text">Your Webhooks ({webhooks.length})</h3>
          </div>
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className={cn(
                "p-5 rounded-xl border transition-all",
                webhook.is_active
                  ? "bg-white border-neutral-border hover:border-electric-sapphire/50 hover:shadow-sm"
                  : "bg-neutral-bg border-neutral-border opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold text-neutral-text">{webhook.name}</h4>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        webhook.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {webhook.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-neutral-muted flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-muted text-xs mb-0.5">URL</div>
                        <code className="text-neutral-text font-mono text-xs break-all">{webhook.url}</code>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Radio className="h-4 w-4 text-neutral-muted flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-muted text-xs mb-1">Events</div>
                        <div className="flex flex-wrap gap-1.5">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="px-2 py-0.5 bg-electric-sapphire/10 text-electric-sapphire rounded text-xs font-mono"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-muted">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Last triggered: {formatDate(webhook.last_triggered_at)}</span>
                      </div>
                      {webhook.failure_count > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <X className="h-3.5 w-3.5" />
                          <span>{webhook.failure_count} {webhook.failure_count === 1 ? "failure" : "failures"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      webhook.is_active
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-green-600 hover:bg-green-50"
                    )}
                    title={webhook.is_active ? "Deactivate" : "Activate"}
                  >
                    {webhook.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Documentation & Best Practices */}
      <div className="mt-6 space-y-3">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-neutral-text mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Security Best Practices
          </h4>
          <ul className="text-xs text-neutral-muted space-y-1.5 ml-6 list-disc">
            <li>Always use HTTPS for webhook URLs</li>
            <li>Verify webhook signatures using the secret</li>
            <li>Respond with 2xx status codes within 5 seconds</li>
            <li>Implement idempotency to handle duplicate events</li>
            <li>Monitor failure counts and set up alerts</li>
          </ul>
        </div>
        <div className="p-4 bg-electric-sapphire/5 rounded-xl border border-electric-sapphire/20">
          <p className="text-sm text-neutral-muted">
            <strong className="text-neutral-text">Need help?</strong> Check out our{" "}
            <Link href="/api-reference" className="text-electric-sapphire hover:underline font-medium">
              webhook setup guide
            </Link>{" "}
            for detailed instructions and code examples.
          </p>
        </div>
      </div>
    </div>
  );
}

