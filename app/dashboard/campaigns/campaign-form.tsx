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
  Info,
  Link2,
  X,
  Sparkles,
  Search,
  ChevronDown,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import type { Campaign } from "@/types/database.types";

interface CampaignFormProps {
  userId: string;
  campaign?: Campaign | null;
}

const CAMPAIGN_TYPES = [
  { value: "product_launch", label: "Product Launch" },
  { value: "seasonal_promotion", label: "Seasonal Promotion" },
  { value: "email_marketing", label: "Email Marketing" },
  { value: "social_media", label: "Social Media" },
  { value: "content_marketing", label: "Content Marketing" },
  { value: "paid_advertising", label: "Paid Advertising" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

export function CampaignForm({ userId, campaign }: CampaignFormProps) {
  const router = useRouter();
  const isEditing = !!campaign;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [targetClicks, setTargetClicks] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Links state
  const [links, setLinks] = useState<any[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSearchQuery, setLinksSearchQuery] = useState("");
  const [linksDropdownOpen, setLinksDropdownOpen] = useState(false);

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

      if (campaign.tags && Array.isArray(campaign.tags) && campaign.tags.length > 0) {
        setTags(campaign.tags.join(", "));
      } else {
        setTags("");
      }

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
    }
  }, [campaign]);

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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save campaign");
      }

      const campaignData = await response.json();
      const campaignId = campaignData.id || campaign?.id;

      // Update link assignments
      if (campaignId) {
        const currentCampaignLinksResponse = await fetch(`/api/campaigns/${campaignId}/links`);
        const currentCampaignLinksData = currentCampaignLinksResponse.ok
          ? await currentCampaignLinksResponse.json()
          : [];
        const currentLinkIds = new Set(currentCampaignLinksData.map((l: any) => l.id) || []);

        // Unassign links that are no longer selected
        for (const linkId of links.map(l => l.id)) {
          if (currentLinkIds.has(linkId) && !selectedLinkIds.has(linkId)) {
            try {
              await fetch(`/api/links/${linkId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaign_id: null }),
              });
            } catch (error) {
              console.error(`Failed to unassign link ${linkId}:`, error);
            }
          }
        }

        // Assign newly selected links
        for (const linkId of Array.from(selectedLinkIds)) {
          if (!currentLinkIds.has(linkId)) {
            try {
              await fetch(`/api/links/${linkId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaign_id: campaignId }),
              });
            } catch (error) {
              console.error(`Failed to assign link ${linkId}:`, error);
            }
          }
        }
      }

      toast.success(isEditing ? "Campaign updated" : "Campaign created");
      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save campaign");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate form completion
  const formCompletion = {
    name: name.trim().length > 0,
    description: description.trim().length > 0,
    campaignType: campaignType.length > 0,
    tags: tags.trim().length > 0,
    dates: startDate || endDate,
    goals: targetClicks.trim() || budget.trim(),
    links: selectedLinkIds.size > 0,
  };
  
  const completionCount = Object.values(formCompletion).filter(Boolean).length;
  const totalFields = Object.keys(formCompletion).length;
  const completionPercentage = Math.round((completionCount / totalFields) * 100);

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
      {/* Form Progress Indicator */}
      {isEditing && (
        <div className="bg-white rounded-card shadow-soft border border-neutral-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric-sapphire" />
              <span className="text-sm font-semibold text-neutral-text">Form Completion</span>
            </div>
            <span className="text-sm font-bold text-electric-sapphire">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-electric-sapphire to-bright-indigo transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form - Single Column with Better Spacing */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Row - Basic Info and Links Side by Side */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Basic Information - Takes 3 columns */}
            <div className="xl:col-span-3 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-electric-sapphire" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-text">Basic Information</h3>
                </div>
                <div className="space-y-5">
                  {/* Campaign Name */}
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                    />
                  </div>

                  {/* Campaign Type and Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-text mb-2">
                        Campaign Type
                      </label>
                      <select
                        value={campaignType}
                        onChange={(e) => setCampaignType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all bg-white"
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the goals, target audience, and key messaging for this campaign..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Timeline */}
              <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-energy" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-text">Dates & Timeline</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Goals & Targets */}
              <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vivid-royal/10 to-indigo-bloom/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-vivid-royal" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-text">Goals & Targets</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      <Target className="h-4 w-4 inline mr-1.5" />
                      Target Clicks
                    </label>
                    <input
                      type="number"
                      value={targetClicks}
                      onChange={(e) => setTargetClicks(e.target.value)}
                      placeholder="e.g., 10000"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-text mb-2">
                      <DollarSign className="h-4 w-4 inline mr-1.5" />
                      Budget (Optional)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Associated Links */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-neon-pink" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-text">Associated Links</h3>
                </div>

              {linksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-electric-sapphire" />
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-neutral-muted mx-auto mb-3" />
                  <p className="text-sm text-neutral-muted mb-4">
                    No links available. Create links to assign them to this campaign.
                  </p>
                  <Link
                    href="/dashboard/links/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all"
                  >
                    Create Link
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Multiselect Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setLinksDropdownOpen(!linksDropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text transition-all flex items-center justify-between bg-white"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-neutral-muted" />
                        <span className={cn(linksSearchQuery ? "text-neutral-text" : "text-neutral-muted")}>
                          {linksSearchQuery || "Search and select links..."}
                        </span>
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-neutral-muted transition-transform", linksDropdownOpen && "rotate-180")} />
                    </button>

                    {linksDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-neutral-border shadow-lg max-h-80 overflow-hidden flex flex-col">
                        {/* Search Input */}
                        <div className="p-3 border-b border-neutral-border">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-muted" />
                            <input
                              type="text"
                              value={linksSearchQuery}
                              onChange={(e) => setLinksSearchQuery(e.target.value)}
                              placeholder="Search by code, title, or URL..."
                              className="w-full pl-10 pr-10 py-2 rounded-lg border-2 border-neutral-border focus:border-electric-sapphire focus:ring-2 focus:ring-electric-sapphire/40 text-sm font-medium text-neutral-text placeholder:text-neutral-muted transition-all"
                              autoFocus
                            />
                            {linksSearchQuery && (
                              <button
                                onClick={() => setLinksSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Links List */}
                        <div className="overflow-y-auto max-h-64">
                          {filteredLinks.length === 0 ? (
                            <div className="p-6 text-center">
                              <p className="text-sm text-neutral-muted">
                                {linksSearchQuery ? "No links found" : "All links are selected"}
                              </p>
                            </div>
                          ) : (
                            filteredLinks.map((link) => {
                              const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                              const shortUrl = `${baseUrl}/${link.short_code}`;
                              
                              return (
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
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Links List */}
                  {selectedLinks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-neutral-text uppercase tracking-wide">
                          Selected Links ({selectedLinks.length})
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
                          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                          const shortUrl = `${baseUrl}/${link.short_code}`;
                          
                          return (
                            <div
                              key={link.id}
                              className="flex items-center gap-3 p-3 rounded-xl border-2 border-electric-sapphire/20 bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5"
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
        </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-card shadow-soft border border-neutral-border p-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/campaigns"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-button",
                loading || !name.trim()
                  ? "bg-neutral-border text-neutral-muted cursor-not-allowed"
                  : "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Campaign" : "Create Campaign"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
