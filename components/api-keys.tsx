"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Calendar, Clock, Check, X, Crown, Loader2, ExternalLink, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { CollapsibleSection } from "./collapsible-section";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiKeysProps {
  userId: string;
  hasApiAccess: boolean;
}

export function ApiKeys({ userId, hasApiAccess }: ApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyToken, setNewKeyToken] = useState<string | null>(null);
  const [showNewToken, setShowNewToken] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hasApiAccess) {
      fetchApiKeys();
    }
  }, [hasApiAccess, userId]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyToken(data.token);
        setShowNewToken(true);
        setNewKeyName("");
        await fetchApiKeys();
        toast.success("API key created successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create API key");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        await fetchApiKeys();
        toast.success(`API key ${!currentStatus ? "activated" : "deactivated"}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update API key");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update API key");
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchApiKeys();
        toast.success("API key deleted");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete API key");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete API key");
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
            <Key className="h-5 w-5 text-electric-sapphire" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-text">API Keys</h2>
        </div>
        <div className="text-center py-8">
          <Crown className="h-12 w-12 text-neon-pink mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-text mb-2">API Access Required</h3>
          <p className="text-sm text-neutral-muted mb-4">
            API access is available on Enterprise plans. Upgrade to create and manage API keys for programmatic access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
          <Key className="h-5 w-5 text-electric-sapphire" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-text">API Keys</h2>
      </div>

      {/* New Key Token Display */}
      {showNewToken && newKeyToken && (
        <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3 mb-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">API Key Created</h3>
              <p className="text-sm text-green-700 mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg font-mono text-sm text-neutral-text">
                  {newKeyToken}
                </code>
                <button
                  onClick={() => handleCopy(newKeyToken, "API key")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewToken(false);
                setNewKeyToken(null);
              }}
              className="text-green-600 hover:text-green-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Create New Key */}
      <div className="mb-6 p-4 bg-neutral-bg rounded-xl border border-neutral-border">
        <h3 className="text-sm font-semibold text-neutral-text mb-3">Create New API Key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter a name for this key (e.g., Production, Development)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-border bg-white text-sm font-medium text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
            disabled={creating}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            className={cn(
              "px-5 py-2 rounded-lg font-semibold text-sm transition-all",
              "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white",
              "hover:from-bright-indigo hover:to-vivid-royal",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Key
              </>
            )}
          </button>
        </div>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 text-neutral-muted mx-auto animate-spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-8">
          <Key className="h-12 w-12 text-neutral-muted mx-auto mb-4" />
          <p className="text-neutral-muted">No API keys yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                key.is_active
                  ? "bg-white border-neutral-border hover:border-electric-sapphire/50"
                  : "bg-neutral-bg border-neutral-border opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-neutral-text">{key.name}</h4>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        key.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-muted">
                    <div className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5" />
                      <code className="font-mono">{key.key_prefix}...</code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last used: {formatDate(key.last_used_at)}</span>
                    </div>
                    {key.expires_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Expires: {formatDate(key.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(key.id, key.is_active)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      key.is_active
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-green-600 hover:bg-green-50"
                    )}
                    title={key.is_active ? "Deactivate" : "Activate"}
                  >
                    {key.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
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

      {/* Base URL Section */}
      <div className="mt-6 p-4 bg-neutral-bg rounded-xl border border-neutral-border">
        <h3 className="text-sm font-semibold text-neutral-text mb-3">Base URL</h3>
        <div className="flex items-center gap-2 mb-4">
          <code className="flex-1 px-3 py-2 bg-white border border-neutral-border rounded-lg font-mono text-sm text-neutral-text">
            {typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "https://your-domain.com/api/v1"}
          </code>
          <button
            onClick={() => handleCopy(
              typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "https://your-domain.com/api/v1",
              "Base URL"
            )}
            className="px-4 py-2 bg-white border border-neutral-border rounded-lg hover:bg-neutral-bg transition-colors flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>
        <p className="text-xs text-neutral-muted">
          Use this base URL for all API requests. Append the endpoint path to this URL.
        </p>
      </div>

      {/* API Reference CTA */}
      <div className="mt-6 p-6 bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-xl border-2 border-electric-sapphire/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-text mb-2">
              Explore API Reference
            </h3>
            <p className="text-sm text-neutral-muted mb-4">
              View detailed API documentation with code examples, request/response formats, and interactive guides for all endpoints.
            </p>
            <Link
              href="/api-reference"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all shadow-button"
            >
              <span>View API Reference</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

