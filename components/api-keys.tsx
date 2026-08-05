"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Check,
  X,
  Crown,
  Loader2,
  ExternalLink,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    if (hasApiAccess) {
      fetchApiKeys();
    } else {
      setLoading(false);
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

  const handleRotate = async (keyId: string) => {
    if (
      !confirm(
        "Rotate this API key? The old secret will stop working immediately. You will get a new token to copy."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}/rotate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to rotate API key");
      }
      setNewKeyToken(data.token);
      setShowNewToken(true);
      await fetchApiKeys();
      toast.success("API key rotated — copy the new token now");
    } catch (error: any) {
      toast.error(error.message || "Failed to rotate API key");
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

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/v1`
      : "https://your-domain.com/api/v1";

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
            API keys are available on Enterprise plans. Upgrade to create and manage keys for
            programmatic access.
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
              <Key className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-text tracking-tight">API Keys</h2>
              <p className="text-sm text-neutral-muted mt-0.5 leading-relaxed">
                Authenticate requests to the lunr.to API
              </p>
            </div>
          </div>
          <Link
            href="/api-reference"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-bright-indigo"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Docs
          </Link>
        </div>

        {showNewToken && newKeyToken && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                  Copy your API key now
                </h3>
                <p className="text-xs text-emerald-800/80 mb-3 leading-relaxed">
                  This secret won’t be shown again.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-xs sm:text-sm text-neutral-text break-all shadow-soft">
                    {newKeyToken}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(newKeyToken, "API key")}
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
                  setShowNewToken(false);
                  setNewKeyToken(null);
                }}
                className="p-1.5 rounded-full text-emerald-700/70 hover:bg-emerald-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-border/80 bg-neutral-bg/50 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-neutral-text tracking-tight mb-3">
            Create new key
          </h3>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Name (e.g. Production)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              className={cn(
                "flex-1 h-11 px-4 rounded-2xl border border-neutral-border/80 bg-white",
                "text-sm text-neutral-text shadow-soft",
                "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary",
                "placeholder:text-neutral-muted/80"
              )}
              disabled={creating}
            />
            <Button
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
              className="shrink-0"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create key
                </>
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-border/80 bg-neutral-bg/30 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Key className="h-5 w-5" />
            </div>
            <p className="text-sm text-neutral-muted">No API keys yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={cn(
                  "rounded-2xl border border-neutral-border/80 bg-white p-4 shadow-soft transition-all",
                  "hover:shadow-hover",
                  !key.is_active && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-text tracking-tight">
                        {key.name}
                      </h4>
                      <Badge variant={key.is_active ? "success" : "default"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-muted">
                      <span className="inline-flex items-center gap-1.5 font-mono">
                        <Key className="h-3.5 w-3.5" />
                        {key.key_prefix}…
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Last used: {formatDate(key.last_used_at)}
                      </span>
                      {key.expires_at && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Expires: {formatDate(key.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRotate(key.id)}
                      className="p-2 rounded-xl text-neutral-muted hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Rotate key"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(key.id, key.is_active)}
                      className="p-2 rounded-xl text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface transition-colors"
                      title={key.is_active ? "Deactivate" : "Activate"}
                    >
                      {key.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(key.id)}
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
          <h3 className="text-sm font-semibold text-neutral-text tracking-tight mb-3">Base URL</h3>
          <div className="flex flex-col sm:flex-row gap-2.5 mb-2">
            <code className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-neutral-border/80 font-mono text-xs sm:text-sm text-neutral-text break-all shadow-soft">
              {baseUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(baseUrl, "Base URL")}
              className="shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-neutral-muted leading-relaxed">
            Append endpoint paths to this base URL for all API requests.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-button">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-text tracking-tight mb-0.5">
              API reference
            </h3>
            <p className="text-xs text-neutral-muted leading-relaxed">
              Endpoints, examples, and request formats for the public API.
            </p>
          </div>
          <Link href="/api-reference" className="shrink-0">
            <Button size="sm">
              Open docs
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
