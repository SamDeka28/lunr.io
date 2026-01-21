"use client";

import { useState } from "react";
import { Globe, Plus, CheckCircle2, XCircle, AlertCircle, ExternalLink, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface Domain {
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
  page: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

interface DomainsPageClientProps {
  domains: Domain[];
  pages: Array<{ id: string; slug: string; title: string }>;
}

export function DomainsPageClient({ domains: initialDomains, pages }: DomainsPageClientProps) {
  const [domains, setDomains] = useState(initialDomains);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);

  const handleVerifyDomain = async (domainId: string, pageId: string) => {
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
      setDomains(
        domains.map((d) => (d.id === domainId ? { ...d, ...data.domain } : d))
      );

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

  const handleDeleteDomain = async (domainId: string, pageId: string) => {
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Custom Domains</h1>
            <p className="text-sm text-neutral-muted">
              Manage custom domains for your pages
            </p>
          </div>
        </div>
      </div>

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-neutral-bg border border-neutral-border rounded-xl p-12 text-center">
          <Globe className="h-16 w-16 text-neutral-text/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-text mb-2">
            No custom domains configured
          </h3>
          <p className="text-sm text-neutral-muted mb-6">
            Add a custom domain to any of your pages to use your own domain
          </p>
          <Link
            href="/dashboard/pages"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] shadow-button"
          >
            <FileText className="h-4 w-4" />
            Go to Pages
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-white border border-neutral-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-5 w-5 text-neutral-text/70" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-text text-lg">
                          {domain.domain}
                        </span>
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
                      {domain.page && (
                        <Link
                          href={`/dashboard/pages/${domain.page.id}/edit`}
                          className="text-sm text-neutral-muted hover:text-electric-sapphire flex items-center gap-1 mt-1"
                        >
                          <FileText className="h-3 w-3" />
                          {domain.page.title} ({domain.page.slug})
                        </Link>
                      )}
                    </div>
                  </div>
                  {domain.ssl_status === "active" && (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      SSL Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {domain.verification_status !== "verified" && (
                    <button
                      onClick={() => handleVerifyDomain(domain.id, domain.page!.id)}
                      disabled={verifyingDomain === domain.id}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {verifyingDomain === domain.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDomain(domain.id, domain.page!.id)}
                    className="p-2 hover:bg-neutral-bg rounded-lg transition-colors"
                    title="Remove domain"
                  >
                    <XCircle className="h-5 w-5 text-neutral-text/70" />
                  </button>
                </div>
              </div>

              {domain.verification_status !== "verified" && (
                <div className="bg-neutral-bg border border-neutral-border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-neutral-text text-sm">
                    DNS Configuration
                  </h4>
                  <p className="text-xs text-neutral-muted">
                    Add these DNS records to your domain provider:
                  </p>
                  <div className="space-y-2">
                    {domain.dns_records?.map((record, index) => (
                      <div
                        key={index}
                        className="bg-white border border-neutral-border rounded p-3 space-y-2"
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
                            className="p-1 hover:bg-neutral-bg rounded transition-colors"
                            title="Copy value"
                          >
                            <svg
                              className="h-3 w-3 text-neutral-text/70"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                        <code className="block text-xs font-mono bg-neutral-bg px-2 py-1 rounded border border-neutral-border text-neutral-text break-all">
                          {record.value}
                        </code>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-border flex items-center gap-4">
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View page <ExternalLink className="h-3 w-3" />
                    </a>
                    {domain.page && (
                      <Link
                        href={`/dashboard/pages/${domain.page.id}/edit`}
                        className="text-xs text-neutral-muted hover:text-electric-sapphire flex items-center gap-1"
                      >
                        Edit page
                      </Link>
                    )}
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

