"use client";

import { useState, useEffect } from "react";
import { Globe, Plus, X, CheckCircle2, XCircle, Loader2, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface CustomDomain {
  id: string;
  domain: string;
  verification_status: "pending" | "verified" | "failed";
  verification_token: string;
  ssl_status: "pending" | "active" | "failed";
  dns_records: Array<{
    type: string;
    name: string;
    value: string;
    priority: number | null;
    ttl: number;
  }>;
  verified_at: string | null;
  created_at: string;
}

interface CustomDomainsProps {
  pageId: string;
}

export function CustomDomains({ pageId }: CustomDomainsProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch domains
  const fetchDomains = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}/domains`);
      if (!response.ok) throw new Error("Failed to fetch domains");
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [pageId]);

  // Add domain
  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setAddingDomain(true);
    try {
      const response = await fetch(`/api/pages/${pageId}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add domain");
      }

      const data = await response.json();
      setDomains([data.domain, ...domains]);
      setNewDomain("");
      setShowAddForm(false);
      toast.success("Domain added! Please configure DNS records.");
    } catch (error: any) {
      toast.error(error.message || "Failed to add domain");
    } finally {
      setAddingDomain(false);
    }
  };

  // Verify domain
  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomain(domainId);
    try {
      const response = await fetch(`/api/pages/${pageId}/domains/${domainId}/verify`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify domain");
      }

      const data = await response.json();
      
      // Update domain in list
      setDomains(domains.map((d) => (d.id === domainId ? data.domain : d)));

      if (data.verification.passed) {
        toast.success("Domain verified successfully!");
      } else {
        toast.error("Domain verification failed. Please check your DNS records.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify domain");
    } finally {
      setVerifyingDomain(null);
    }
  };

  // Delete domain
  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this domain?")) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete domain");
      }

      setDomains(domains.filter((d) => d.id !== domainId));
      toast.success("Domain removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete domain");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-text" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-text">Custom Domains</h3>
          <p className="text-sm text-neutral-text/70 mt-1">
            Connect your own domain to your page
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-neutral-bg border border-neutral-border rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Domain Name
            </label>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-neutral-border rounded-lg bg-white text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddDomain();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setNewDomain("");
                }
              }}
            />
            <p className="text-xs text-neutral-text/60 mt-1">
              Enter your domain without http:// or https://
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddDomain}
              disabled={addingDomain || !newDomain.trim()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {addingDomain ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Adding...
                </>
              ) : (
                "Add Domain"
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewDomain("");
              }}
              className="px-4 py-2 border border-neutral-border rounded-lg hover:bg-neutral-bg transition-colors text-sm font-medium text-neutral-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {domains.length === 0 && !showAddForm ? (
        <div className="bg-neutral-bg border border-neutral-border rounded-lg p-8 text-center">
          <Globe className="h-12 w-12 text-neutral-text/30 mx-auto mb-4" />
          <p className="text-neutral-text/70 mb-2">No custom domains configured</p>
          <p className="text-sm text-neutral-text/50">
            Add a domain to use your own custom domain for this page
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-neutral-bg border border-neutral-border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-neutral-text/70" />
                    <span className="font-medium text-neutral-text">{domain.domain}</span>
                    {domain.verification_status === "verified" ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    ) : domain.verification_status === "failed" ? (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        Failed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                  </div>
                  {domain.ssl_status === "active" && (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      SSL Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteDomain(domain.id)}
                  className="p-2 hover:bg-neutral-border rounded-lg transition-colors"
                  title="Remove domain"
                >
                  <X className="h-4 w-4 text-neutral-text/70" />
                </button>
              </div>

              {domain.verification_status !== "verified" && (
                <div className="bg-white border border-neutral-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-text text-sm">
                      DNS Configuration
                    </h4>
                    <button
                      onClick={() => handleVerifyDomain(domain.id)}
                      disabled={verifyingDomain === domain.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      {verifyingDomain === domain.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-text/70">
                    Add these DNS records to your domain provider:
                  </p>
                  <div className="space-y-2">
                    {domain.dns_records?.map((record, index) => (
                      <div
                        key={index}
                        className="bg-neutral-bg border border-neutral-border rounded p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-neutral-text/70">
                              {record.type}
                            </span>
                            <span className="text-xs text-neutral-text/60">
                              {record.name}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(record.value, "DNS Record")}
                            className="p-1 hover:bg-neutral-border rounded transition-colors"
                            title="Copy value"
                          >
                            <Copy className="h-3 w-3 text-neutral-text/70" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs font-mono bg-white px-2 py-1 rounded border border-neutral-border text-neutral-text break-all">
                            {record.value}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-border">
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View page <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {domain.verification_status === "verified" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✓ Domain verified! Your page is now accessible at{" "}
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      https://{domain.domain}
                    </a>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

