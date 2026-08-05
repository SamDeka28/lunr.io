"use client";

import { useState } from "react";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { Globe, CheckCircle2, XCircle, AlertCircle, ExternalLink, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
    <DashboardContainer>
      <PageHeader
        title="Custom Domains"
        description="Manage custom domains for your pages"
      />

      {/* Domains List */}
      {domains.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No custom domains configured"
          description="Add a custom domain to any of your pages to use your own domain"
          action={
            <Link href="/dashboard/pages">
              <Button>
                <FileText className="h-4 w-4" />
                Go to Pages
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-white border border-neutral-border/80 rounded-card p-4 sm:p-6 space-y-4 shadow-soft"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Globe className="h-5 w-5 text-neutral-text/70 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-neutral-text text-base sm:text-lg break-all">
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
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{domain.page.title} ({domain.page.slug})</span>
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
                <div className="flex items-center gap-2 shrink-0">
                  {domain.verification_status !== "verified" && (
                    <Button
                      size="sm"
                      onClick={() => handleVerifyDomain(domain.id, domain.page!.id)}
                      disabled={verifyingDomain === domain.id}
                    >
                      {verifyingDomain === domain.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  )}
                  <button
                    onClick={() => handleDeleteDomain(domain.id, domain.page!.id)}
                    className="p-2 hover:bg-neutral-bg rounded-full transition-colors"
                    title="Remove domain"
                  >
                    <XCircle className="h-5 w-5 text-neutral-text/70" />
                  </button>
                </div>
              </div>

              {domain.verification_status !== "verified" && (
                <div className="bg-white border border-neutral-border/80 rounded-2xl p-4 space-y-3 shadow-soft">
                  <h4 className="font-medium text-neutral-text text-sm">
                    DNS Configuration
                  </h4>
                  <p className="text-xs text-neutral-muted">
                    Add these DNS records to your domain provider. Point a CNAME to your app host.
                    Apex domains need CNAME flattening or an ALIAS record. TLS is terminated at your
                    DNS/CDN (Vercel/Cloudflare) until auto-SSL is available.
                  </p>
                  <div className="space-y-2">
                    {domain.dns_records?.map((record, index) => (
                      <div
                        key={index}
                        className="bg-neutral-surface/50 border border-neutral-border/80 rounded-xl p-3 space-y-2"
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
                        <code className="block text-xs font-mono bg-white px-2 py-1.5 rounded-lg border border-neutral-border/80 text-neutral-text break-all">
                          {record.value}
                        </code>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-border/80 flex items-center gap-4">
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
                <div className="bg-green-50/80 border border-green-200/80 rounded-2xl p-3 space-y-2 shadow-soft">
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
                  <p className="text-xs text-green-700/90">
                    TLS/SSL should be terminated at your DNS or CDN provider (Vercel, Cloudflare, etc.) until auto-SSL ships.
                    For apex domains, use CNAME flattening or an ALIAS/ANAME record pointing to the same target as your CNAME.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardContainer>
  );
}

