"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Calendar,
  Loader2,
  ArrowLeft,
  Target,
  DollarSign,
  Tag,
  X,
  Search,
  ChevronDown,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import type { Campaign } from "@/types/database.types";
import { LabelWithTip, InfoTooltip } from "@/components/ui/info-tooltip";
import { CAMPAIGN_CURRENCIES, normalizeCurrency } from "@/lib/utils/currency";
import {
  CAMPAIGN_TYPES,
  DEFAULT_CAMPAIGN_TYPE,
} from "@/lib/utils/campaign-studio";

interface CampaignFormProps {
  userId: string;
  campaign?: Campaign | null;
}

export function CampaignForm({ userId, campaign }: CampaignFormProps) {
  const router = useRouter();
  const isEditing = !!campaign;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState(
    campaign ? "" : DEFAULT_CAMPAIGN_TYPE
  );
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [targetClicks, setTargetClicks] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tags, setTags] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmCampaignTouched, setUtmCampaignTouched] = useState(false);
  const [defaultDestinationUrl, setDefaultDestinationUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Links state
  const [links, setLinks] = useState<any[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSearchQuery, setLinksSearchQuery] = useState("");
  const [linksDropdownOpen, setLinksDropdownOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Initialize form fields from campaign data
  useEffect(() => {
    if (campaign) {
      setName(campaign.name || "");
      setDescription(campaign.description || "");

      if ('campaign_type' in campaign && campaign.campaign_type && typeof campaign.campaign_type === 'string') {
        const validType = CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type);
        setCampaignType(validType ? campaign.campaign_type : "");
      } else {
        setCampaignType("");
      }

      if ('target_clicks' in campaign && campaign.target_clicks !== null && campaign.target_clicks !== undefined) {
        setTargetClicks(String(campaign.target_clicks));
      } else {
        setTargetClicks("");
      }

      if ('budget' in campaign && campaign.budget !== null && campaign.budget !== undefined) {
        setBudget(String(campaign.budget));
      } else {
        setBudget("");
      }

      setCurrency(normalizeCurrency(campaign.currency));

      if (campaign.tags && Array.isArray(campaign.tags) && campaign.tags.length > 0) {
        setTags(campaign.tags.join(", "));
      } else {
        setTags("");
      }

      setDefaultDestinationUrl(campaign.default_destination_url || "");

      if (campaign.start_date) {
        try {
          const start = new Date(campaign.start_date);
          setStartDate(start.toISOString().split("T")[0]);
          const hours = start.getHours().toString().padStart(2, "0");
          const minutes = start.getMinutes().toString().padStart(2, "0");
          setStartTime(`${hours}:${minutes}`);
        } catch (e) {
          console.error("Error parsing start date:", e);
        }
      }

      if (campaign.end_date) {
        try {
          const end = new Date(campaign.end_date);
          setEndDate(end.toISOString().split("T")[0]);
          const hours = end.getHours().toString().padStart(2, "0");
          const minutes = end.getMinutes().toString().padStart(2, "0");
          setEndTime(`${hours}:${minutes}`);
        } catch (e) {
          console.error("Error parsing end date:", e);
        }
      }

      const defaults = campaign.utm_defaults || {};
      setUtmSource(defaults.utm_source || "");
      setUtmMedium(defaults.utm_medium || "");
      setUtmCampaign(defaults.utm_campaign || "");
      setUtmTerm(defaults.utm_term || "");
      setUtmContent(defaults.utm_content || "");
      setUtmCampaignTouched(!!defaults.utm_campaign);
    }
  }, [campaign]);

  // Auto-fill utm_campaign from name slug until the user edits it
  useEffect(() => {
    if (utmCampaignTouched || isEditing) return;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setUtmCampaign(slug);
  }, [name, utmCampaignTouched, isEditing]);
  // Fetch all user links and pre-select if editing
  useEffect(() => {
    const fetchLinks = async () => {
      setLinksLoading(true);
      try {
        const response = await fetch("/api/links?all=true");
        if (response.ok) {
          const data = await response.json();
          setLinks(data.links || []);

          if (isEditing && campaign?.id) {
            const assignedLinksResponse = await fetch(`/api/campaigns/${campaign.id}/links`);
            if (assignedLinksResponse.ok) {
              const assignedLinksData = await assignedLinksResponse.json();
              const assignedLinkIds = new Set<string>(assignedLinksData.map((link: any) => link.id));
              setSelectedLinkIds(assignedLinkIds);
            }
          }
        } else {
          toast.error("Failed to fetch links");
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
        toast.error("Failed to fetch links");
      } finally {
        setLinksLoading(false);
      }
    };

    fetchLinks();
  }, [isEditing, campaign]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLinksDropdownOpen(false);
      }
    };

    if (linksDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [linksDropdownOpen]);

  const toggleLinkSelection = (linkId: string) => {
    setSelectedLinkIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(linkId)) {
        newSet.delete(linkId);
      } else {
        newSet.add(linkId);
      }
      return newSet;
    });
  };

  const removeLink = (linkId: string) => {
    setSelectedLinkIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(linkId);
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalStartDate = null;
      if (startDate) {
        if (startTime) {
          finalStartDate = new Date(`${startDate}T${startTime}`).toISOString();
        } else {
          finalStartDate = new Date(`${startDate}T00:00:00`).toISOString();
        }
      }

      let finalEndDate = null;
      if (endDate) {
        if (endTime) {
          finalEndDate = new Date(`${endDate}T${endTime}`).toISOString();
        } else {
          finalEndDate = new Date(`${endDate}T23:59:59`).toISOString();
        }
      }

      if (finalStartDate && finalEndDate && new Date(finalStartDate) > new Date(finalEndDate)) {
        toast.error("Start date must be before end date");
        setLoading(false);
        return;
      }

      const url = isEditing ? `/api/campaigns/${campaign.id}` : "/api/campaigns";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          campaign_type: campaignType || null,
          tags: tags.trim() ? tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "") : null,
          start_date: finalStartDate,
          end_date: finalEndDate,
          target_clicks: targetClicks.trim() ? parseInt(targetClicks, 10) : 0,
          budget: budget.trim() ? parseFloat(budget) : 0,
          currency: normalizeCurrency(currency),
          default_destination_url: defaultDestinationUrl.trim() || null,
          utm_defaults: {
            utm_source: utmSource.trim() || undefined,
            utm_medium: utmMedium.trim() || undefined,
            utm_campaign: utmCampaign.trim() || undefined,
            utm_term: utmTerm.trim() || undefined,
            utm_content: utmContent.trim() || undefined,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save campaign");
      }

      const campaignData = await response.json();
      const campaignId = campaignData.id || campaign?.id;

      // Bulk assign / unassign links
      if (campaignId) {
        const currentCampaignLinksResponse = await fetch(`/api/campaigns/${campaignId}/links`);
        const currentCampaignLinksData = currentCampaignLinksResponse.ok
          ? await currentCampaignLinksResponse.json()
          : [];
        const currentLinkIds = new Set(
          (Array.isArray(currentCampaignLinksData) ? currentCampaignLinksData : []).map(
            (l: any) => l.id
          )
        );

        const toUnassign = [...currentLinkIds].filter((id) => !selectedLinkIds.has(id as string));
        const toAssign = [...selectedLinkIds].filter((id) => !currentLinkIds.has(id));

        if (toUnassign.length > 0) {
          await fetch(`/api/campaigns/${campaignId}/links`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ link_ids: toUnassign, action: "unassign" }),
          });
        }
        if (toAssign.length > 0) {
          await fetch(`/api/campaigns/${campaignId}/links`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ link_ids: toAssign, action: "assign" }),
          });
        }
      }

      if (isEditing && campaignData.utm_links_updated > 0) {
        toast.success(
          `Campaign updated · UTM defaults applied to ${campaignData.utm_links_updated} link(s)`
        );
      } else {
        toast.success(isEditing ? "Campaign updated" : "Campaign created");
      }
      router.push(campaignId ? `/dashboard/campaigns/${campaignId}` : "/dashboard/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save campaign");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Get selected links for display
  const selectedLinks = links.filter(link => selectedLinkIds.has(link.id));
  const filteredLinks = links.filter((link) => {
    if (!linksSearchQuery) return true;
    const query = linksSearchQuery.toLowerCase();
    return (
      link.short_code?.toLowerCase().includes(query) ||
      link.title?.toLowerCase().includes(query) ||
      link.original_url?.toLowerCase().includes(query)
    );
  }).filter(link => !selectedLinkIds.has(link.id)); // Exclude already selected

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditing && (
          <div className="rounded-2xl border border-neutral-border/80 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-neutral-text mb-1">
              Quick start
            </h2>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Name the initiative and set a few planning fields. You&apos;ll add links, partners, and Pixel
              tracking in Campaign Studio after create.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-border p-5">
            <div className="flex items-center gap-3 mb-5">
              <Monitor className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-neutral-text">Basic information</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Sale 2024, Product Launch Q4"
                  required
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-text mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all bg-white"
                  >
                    <option value="">Select type (optional)</option>
                    {CAMPAIGN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-text mb-2">
                    <Tag className="h-4 w-4 inline mr-1.5" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., summer, sale, email, social"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional — goals, audience, or messaging notes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-border p-5">
            <div className="flex items-center gap-3 mb-5">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-neutral-text">Dates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-text mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-border p-5">
            <div className="flex items-center gap-3 mb-5">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-neutral-text">Budget</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <LabelWithTip
                  tip="Currency for planned budget, partner fees, and spend."
                  className="mb-2"
                >
                  Currency
                </LabelWithTip>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text bg-white transition-all"
                >
                  {CAMPAIGN_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <LabelWithTip
                  tip="Planning estimate — not actual cost. CPC uses logged spend under Spend."
                  className="mb-2"
                >
                  Planned budget
                </LabelWithTip>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-muted">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-border overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-bg/50 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-neutral-text">Advanced</h3>
                <p className="text-xs text-neutral-muted mt-0.5">
                  Destination URL, UTM defaults, click target, and optional link assignment
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-neutral-muted transition-transform shrink-0",
                  advancedOpen && "rotate-180"
                )}
              />
            </button>

            {advancedOpen && (
              <div className="border-t border-neutral-border p-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <LabelWithTip
                      tip="Goal for how many clicks this campaign should drive."
                      className="mb-2"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-4 w-4" />
                        Target clicks
                      </span>
                    </LabelWithTip>
                    <input
                      type="number"
                      value={targetClicks}
                      onChange={(e) => setTargetClicks(e.target.value)}
                      placeholder="e.g., 10000"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTip
                      tip="Default long URL for partner tracking links."
                      className="mb-2"
                    >
                      Default destination URL
                    </LabelWithTip>
                    <input
                      type="url"
                      value={defaultDestinationUrl}
                      onChange={(e) => setDefaultDestinationUrl(e.target.value)}
                      placeholder="https://example.com/landing"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-text mb-1 inline-flex items-center gap-2">
                    Default UTM parameters
                    <InfoTooltip text="UTM tags are query params added to URLs so analytics tools can tell where traffic came from." />
                  </h4>
                  <p className="text-xs text-neutral-muted mb-4">
                    Applied to links assigned to this campaign. Link-specific values always win.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <LabelWithTip tip="e.g. newsletter, instagram, google" className="mb-2">
                        utm_source
                      </LabelWithTip>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="e.g., newsletter"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                    <div>
                      <LabelWithTip tip="e.g. email, social, cpc, affiliate" className="mb-2">
                        utm_medium
                      </LabelWithTip>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="e.g., email"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                    <div>
                      <LabelWithTip tip="Defaults to a slug of the campaign name if blank" className="mb-2">
                        utm_campaign
                      </LabelWithTip>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => {
                          setUtmCampaignTouched(true);
                          setUtmCampaign(e.target.value);
                        }}
                        placeholder="Defaults to campaign name slug"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                    <div>
                      <LabelWithTip tip="Optional. Often used for paid search keywords." className="mb-2">
                        utm_term
                      </LabelWithTip>
                      <input
                        type="text"
                        value={utmTerm}
                        onChange={(e) => setUtmTerm(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <LabelWithTip tip="Optional. Differentiates creatives or partner handles." className="mb-2">
                        utm_content
                      </LabelWithTip>
                      <input
                        type="text"
                        value={utmContent}
                        onChange={(e) => setUtmContent(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-text mb-1">
                    Assign existing links
                  </h4>
                  <p className="text-xs text-neutral-muted mb-4">
                    Optional. Prefer adding links from the Campaign Studio Links tab after create.
                  </p>

                  {linksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-electric-sapphire" />
                    </div>
                  ) : links.length === 0 ? (
                    <p className="text-sm text-neutral-muted">
                      No links yet.{" "}
                      <Link
                        href="/dashboard/links/new"
                        className="text-electric-sapphire font-medium hover:underline"
                      >
                        Create a link
                      </Link>{" "}
                      or assign from Studio later.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setLinksDropdownOpen(!linksDropdownOpen)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-border hover:border-electric-sapphire focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all flex items-center justify-between bg-white"
                        >
                          <span className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-neutral-muted" />
                            <span
                              className={cn(
                                linksSearchQuery ? "text-neutral-text" : "text-neutral-muted"
                              )}
                            >
                              {linksSearchQuery || "Search and select links..."}
                            </span>
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-neutral-muted transition-transform",
                              linksDropdownOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {linksDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-border shadow-lg max-h-80 overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-neutral-border">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
                                <input
                                  type="text"
                                  value={linksSearchQuery}
                                  onChange={(e) => setLinksSearchQuery(e.target.value)}
                                  placeholder="Search by code, title, or URL..."
                                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                                  autoFocus
                                />
                                {linksSearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => setLinksSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="overflow-y-auto max-h-64">
                              {filteredLinks.length === 0 ? (
                                <div className="p-6 text-center">
                                  <p className="text-sm text-neutral-muted">
                                    {linksSearchQuery ? "No links found" : "All links are selected"}
                                  </p>
                                </div>
                              ) : (
                                filteredLinks.map((link) => (
                                  <button
                                    key={link.id}
                                    type="button"
                                    onClick={() => {
                                      toggleLinkSelection(link.id);
                                      setLinksSearchQuery("");
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-neutral-bg transition-colors border-b border-neutral-border last:border-b-0 flex items-center gap-3"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm font-semibold text-electric-sapphire">
                                          /{link.short_code}
                                        </span>
                                        {link.click_count > 0 && (
                                          <span className="text-xs text-neutral-muted">
                                            ({link.click_count} clicks)
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-neutral-muted truncate">
                                        {link.title || link.original_url}
                                      </div>
                                    </div>
                                    <Check className="h-4 w-4 text-electric-sapphire flex-shrink-0" />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedLinks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-neutral-text uppercase tracking-wide">
                              Selected ({selectedLinks.length})
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedLinkIds(new Set())}
                              className="text-xs font-semibold text-neutral-muted hover:text-electric-sapphire transition-colors"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedLinks.map((link) => {
                              const baseUrl =
                                typeof window !== "undefined" ? window.location.origin : "";
                              const shortUrl = `${baseUrl}/${link.short_code}`;

                              return (
                                <div
                                  key={link.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-border bg-neutral-bg/40"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono text-sm font-semibold text-electric-sapphire">
                                        /{link.short_code}
                                      </span>
                                      {link.click_count > 0 && (
                                        <span className="text-xs text-neutral-muted">
                                          ({link.click_count} clicks)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-neutral-muted truncate">
                                      {link.title || link.original_url}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <a
                                      href={shortUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => removeLink(link.id)}
                                      className="p-1.5 rounded-lg text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-border p-5">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/campaigns"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-border hover:bg-neutral-bg text-sm font-medium text-neutral-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                loading || !name.trim()
                  ? "bg-neutral-border text-neutral-muted cursor-not-allowed"
                  : "bg-primary text-white hover:bg-bright-indigo"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Campaign"
              ) : (
                "Create & open workspace"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
