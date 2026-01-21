"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, ChevronDown, ChevronRight, Globe, Lock, Link2, Plus, X, Mail, Twitter, Instagram, Linkedin, Github, Youtube, Facebook, Palette } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { usePlan } from "@/hooks/use-plan";
import { SuccessModal } from "@/components/success-modal";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

export default function PageForm({ userId, userLinks }: { userId: string; userLinks?: any[] }) {
  const {
    plan,
    planName,
    planDisplayName,
    isPremium,
    usage,
    refreshUserData,
  } = usePlan();

  // Handle unlimited pages (-1) and undefined/null cases
  // If usage is not loaded yet, fall back to plan's maxPages
  const maxPages = plan?.maxPages === -1 ? Infinity : (plan?.maxPages || 0);
  
  // If plan has unlimited pages, always show unlimited (safeguard against stale usage data)
  const remainingPages = maxPages === Infinity 
    ? Infinity 
    : (usage?.remainingPages === -1 
        ? Infinity 
        : (usage?.remainingPages !== undefined && usage?.remainingPages !== null 
            ? usage.remainingPages 
            : maxPages));
  
  // If plan has unlimited pages, user can always create pages
  const canCreatePage = maxPages === Infinity 
    ? true 
    : (usage?.canCreatePage ?? (maxPages > 0));

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPage, setCreatedPage] = useState<any>(null);

  // Form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Links state
  const [pageLinks, setPageLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  // Design state
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [buttonColor, setButtonColor] = useState("#3B82F6");
  const [buttonTextColor, setButtonTextColor] = useState("#FFFFFF");
  
  // Advanced customization state
  const [fontFamily, setFontFamily] = useState("Inter");
  const [titleFontSize, setTitleFontSize] = useState(48);
  const [descriptionFontSize, setDescriptionFontSize] = useState(18);
  const [buttonBorderRadius, setButtonBorderRadius] = useState(12);
  const [buttonPadding, setButtonPadding] = useState(16);
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("center");
  const [spacing, setSpacing] = useState(24);
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient">("solid");
  const [gradientColors, setGradientColors] = useState({ start: "#FFFFFF", end: "#F3F4F6" });
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showProfileImage, setShowProfileImage] = useState(false);

  // Collapsible sections
  const [basicOpen, setBasicOpen] = useState(true);
  const [linksOpen, setLinksOpen] = useState(true);
  const [socialOpen, setSocialOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Add link from existing links
  const handleAddExistingLink = (link: any) => {
    const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${link.short_code}`;
    setPageLinks([...pageLinks, {
      id: link.id,
      title: link.title || link.short_code,
      url: shortUrl,
    }]);
    toast.success("Link added");
  };

  // Add new custom link
  const handleAddCustomLink = () => {
    if (!newLinkUrl || !newLinkTitle) {
      toast.error("Please provide both title and URL");
      return;
    }

    // Validate URL
    try {
      new URL(newLinkUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setPageLinks([...pageLinks, {
      id: `custom-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl,
    }]);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setShowAddLink(false);
    toast.success("Link added");
  };

  // Remove link
  const handleRemoveLink = (index: number) => {
    setPageLinks(pageLinks.filter((_, i) => i !== index));
  };

  // Move link up/down
  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const newLinks = [...pageLinks];
    if (direction === "up" && index > 0) {
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    } else if (direction === "down" && index < newLinks.length - 1) {
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    }
    setPageLinks(newLinks);
  };

  // Update social link
  const handleSocialLinkChange = (platform: string, url: string) => {
    setSocialLinks({
      ...socialLinks,
      [platform]: url,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          title,
          description: description || null,
          content: {
            fontFamily,
            titleFontSize,
            descriptionFontSize,
            buttonBorderRadius,
            buttonPadding,
            textAlignment,
            spacing,
            backgroundType,
            gradientColors,
            profileImageUrl: showProfileImage ? profileImageUrl : "",
            showProfileImage,
          },
          links: pageLinks.map(link => ({
            id: link.id,
            title: link.title,
            url: link.url,
          })),
          social_links: socialLinks,
          background_color: backgroundColor,
          text_color: textColor,
          button_color: buttonColor,
          button_text_color: buttonTextColor,
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create page");
      }

      const pageData = await response.json();
      setCreatedPage(pageData);

      // Show success modal instead of redirecting
      setShowSuccessModal(true);
      refreshUserData();
    } catch (err: any) {
      setError(err.message || "Failed to create page");
      toast.error(err.message || "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (createdPage) {
      router.push(`/dashboard/pages/${createdPage.id}/edit`);
    }
  };

  const handleViewPage = () => {
    if (createdPage) {
      setShowSuccessModal(false);
      const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${createdPage.slug}`;
      window.open(pageUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyCode = () => {
    if (createdPage) {
      const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${createdPage.slug}`;
      navigator.clipboard.writeText(pageUrl);
      toast.success("Page URL copied to clipboard!");
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedPage(null);
    setSlug("");
    setTitle("");
    setDescription("");
    setPageLinks([]);
    setSocialLinks({});
    setBackgroundColor("#FFFFFF");
    setTextColor("#000000");
    setButtonColor("#3B82F6");
    setButtonTextColor("#FFFFFF");
    setFontFamily("Inter");
    setTitleFontSize(48);
    setDescriptionFontSize(18);
    setButtonBorderRadius(12);
    setButtonPadding(16);
    setTextAlignment("center");
    setSpacing(24);
    setBackgroundType("solid");
    setGradientColors({ start: "#FFFFFF", end: "#F3F4F6" });
    setProfileImageUrl("");
    setShowProfileImage(false);
    router.push("/dashboard/pages/new");
  };

  const pageUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${slug}` : "";

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Create a new page</h1>
            <p className="text-sm text-neutral-muted">
              Build a custom landing page with your links
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information Section */}
            <CollapsibleSection
              title="Basic Information"
              isOpen={basicOpen}
              onToggle={setBasicOpen}
            >
              <div className="space-y-4 pt-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <p className="text-xs text-neutral-muted">
                    {remainingPages === Infinity ? (
                      <>
                        You're on the <span className="font-semibold text-electric-sapphire">{planName}</span> plan with unlimited pages.
                      </>
                    ) : (
                      <>
                        You can create <span className="font-semibold text-electric-sapphire">{remainingPages}</span> more {remainingPages === 1 ? "page" : "pages"} this month.{" "}
                        <a href="/dashboard/billing" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
                          Upgrade for more →
                        </a>
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Page Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-muted font-mono px-3 py-2 bg-neutral-bg rounded-xl border border-neutral-border">
                      {typeof window !== "undefined" ? window.location.host : "lunr.to"}/p/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setSlug(value);
                      }}
                      placeholder="my-page"
                      pattern="^[a-z0-9-]+$"
                      minLength={2}
                      maxLength={100}
                      required
                      className={cn(
                        "flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border",
                        "bg-white text-neutral-text text-sm font-mono font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-muted">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Awesome Page"
                    required
                    className={cn(
                      "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                      "text-neutral-text text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of your page..."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 border-neutral-border",
                      "bg-white text-neutral-text text-sm font-medium resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Links Section */}
            <CollapsibleSection
              title={`Links (${pageLinks.length})`}
              isOpen={linksOpen}
              onToggle={setLinksOpen}
            >
              <div className="space-y-4 pt-4">
                {/* Add from existing links */}
                {userLinks && userLinks.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Add from your links
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {userLinks
                        .filter(link => !pageLinks.some(pl => pl.id === link.id))
                        .map((link) => (
                          <button
                            key={link.id}
                            type="button"
                            onClick={() => handleAddExistingLink(link)}
                            className="flex items-center justify-between p-3 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5 transition-all text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-neutral-text truncate">
                                {link.title || link.short_code}
                              </div>
                              <div className="text-xs text-neutral-muted truncate">
                                {link.original_url}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-electric-sapphire flex-shrink-0 ml-2" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add custom link */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
                      Add custom link
                    </label>
                    {!showAddLink && (
                      <button
                        type="button"
                        onClick={() => setShowAddLink(true)}
                        className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Link
                      </button>
                    )}
                  </div>
                  {showAddLink && (
                    <div className="p-4 rounded-xl border-2 border-neutral-border bg-neutral-bg space-y-3">
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Link title"
                        className={cn(
                          "w-full h-10 px-3 rounded-xl border-2 border-neutral-border",
                          "bg-white text-neutral-text text-sm font-medium",
                          "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        )}
                      />
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className={cn(
                          "w-full h-10 px-3 rounded-xl border-2 border-neutral-border",
                          "bg-white text-neutral-text text-sm font-medium",
                          "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        )}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCustomLink}
                          className="flex-1 h-10 px-4 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddLink(false);
                            setNewLinkTitle("");
                            setNewLinkUrl("");
                          }}
                          className="h-10 px-4 rounded-xl border-2 border-neutral-border text-neutral-text text-sm font-semibold hover:bg-neutral-bg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links list */}
                {pageLinks.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Page Links ({pageLinks.length})
                    </label>
                    {pageLinks.map((link, index) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 p-3 rounded-xl border-2 border-neutral-border bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-neutral-text truncate">
                            {link.title}
                          </div>
                          <div className="text-xs text-neutral-muted truncate">
                            {link.url}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLink(index, "up")}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors disabled:opacity-30"
                            title="Move up"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink(index, "down")}
                            disabled={index === pageLinks.length - 1}
                            className="p-1.5 rounded-lg text-neutral-muted hover:text-electric-sapphire hover:bg-electric-sapphire/10 transition-colors disabled:opacity-30"
                            title="Move down"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="p-1.5 rounded-lg text-neutral-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Social Links Section */}
            <CollapsibleSection
              title="Social Links"
              isOpen={socialOpen}
              onToggle={setSocialOpen}
            >
              <div className="space-y-3 pt-4">
                {["email", "twitter", "instagram", "linkedin", "github", "youtube", "facebook", "website"].map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </label>
                    <input
                      type={platform === "email" ? "email" : "url"}
                      value={socialLinks[platform] || ""}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      placeholder={platform === "email" ? "your@email.com" : `https://${platform}.com/yourprofile`}
                      className={cn(
                        "w-full h-10 px-3 rounded-xl border-2 border-neutral-border",
                        "bg-white text-neutral-text text-sm font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                      )}
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Design Section */}
            <CollapsibleSection
              title="Design & Colors"
              isOpen={designOpen}
              onToggle={setDesignOpen}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Background Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBackgroundType("solid")}
                      className={cn(
                        "flex-1 h-10 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                        backgroundType === "solid"
                          ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                          : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                      )}
                    >
                      Solid Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundType("gradient")}
                      className={cn(
                        "flex-1 h-10 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                        backgroundType === "gradient"
                          ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                          : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                      )}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {backgroundType === "solid" ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    />
                  </div>
                </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        Gradient Start Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={gradientColors.start}
                          onChange={(e) => setGradientColors({ ...gradientColors, start: e.target.value })}
                          className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={gradientColors.start}
                          onChange={(e) => setGradientColors({ ...gradientColors, start: e.target.value })}
                          className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        Gradient End Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={gradientColors.end}
                          onChange={(e) => setGradientColors({ ...gradientColors, end: e.target.value })}
                          className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={gradientColors.end}
                          onChange={(e) => setGradientColors({ ...gradientColors, end: e.target.value })}
                          className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Button Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Button Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-16 h-12 rounded-xl border-2 border-neutral-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-neutral-border text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Button Border Radius: {buttonBorderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={buttonBorderRadius}
                    onChange={(e) => setButtonBorderRadius(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
                  />
                  <div className="flex justify-between text-xs text-neutral-muted mt-1">
                    <span>0px</span>
                    <span>50px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Button Padding: {buttonPadding}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={buttonPadding}
                    onChange={(e) => setButtonPadding(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
                  />
                  <div className="flex justify-between text-xs text-neutral-muted mt-1">
                    <span>8px</span>
                    <span>32px</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Typography Section */}
            <CollapsibleSection
              title="Typography"
              isOpen={typographyOpen}
              onToggle={setTypographyOpen}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Nunito">Nunito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Title Font Size: {titleFontSize}px
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
                  />
                  <div className="flex justify-between text-xs text-neutral-muted mt-1">
                    <span>24px</span>
                    <span>72px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Description Font Size: {descriptionFontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={descriptionFontSize}
                    onChange={(e) => setDescriptionFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
                  />
                  <div className="flex justify-between text-xs text-neutral-muted mt-1">
                    <span>12px</span>
                    <span>32px</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Layout Section */}
            <CollapsibleSection
              title="Layout & Spacing"
              isOpen={layoutOpen}
              onToggle={setLayoutOpen}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setTextAlignment(align)}
                        className={cn(
                          "flex-1 h-10 px-4 rounded-xl border-2 text-sm font-semibold transition-all capitalize",
                          textAlignment === align
                            ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                            : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                        )}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Spacing Between Elements: {spacing}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
                  />
                  <div className="flex justify-between text-xs text-neutral-muted mt-1">
                    <span>8px</span>
                    <span>64px</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Profile Image</div>
                      <div className="text-xs text-neutral-muted">
                        Add a profile picture or logo at the top
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={showProfileImage}
                      onChange={setShowProfileImage}
                    />
                  </div>
                  {showProfileImage && (
                    <div className="mt-3">
                      <input
                        type="url"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                      />
                      <p className="text-xs text-neutral-muted mt-2">
                        Enter the URL of your profile image
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Settings Section */}
            <CollapsibleSection
              title="Settings"
              isOpen={settingsOpen}
              onToggle={setSettingsOpen}
            >
              <div className="pt-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      {isPublic ? (
                        <Globe className="h-5 w-5 text-electric-sapphire" />
                      ) : (
                        <Lock className="h-5 w-5 text-electric-sapphire" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Public Page</div>
                      <div className="text-xs text-neutral-muted">
                        {isPublic ? "Anyone with the link can view this page" : "Only you can view this page"}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={isPublic}
                    onChange={setIsPublic}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-11 px-6 rounded-xl border-2 border-neutral-border text-neutral-text text-sm font-semibold hover:bg-neutral-bg hover:border-neutral-text transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !slug || !title}
                className={cn(
                  "h-11 px-6 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Page
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-white border-l border-neutral-border p-6 overflow-y-auto flex-shrink-0">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-neutral-text mb-1">Preview</h3>
          <p className="text-xs text-neutral-muted">See how your page will look</p>
        </div>
        {pageUrl ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
              <p className="text-xs font-semibold text-neutral-muted mb-1 uppercase tracking-wide">Page URL</p>
              <p className="text-sm text-electric-sapphire font-mono break-all font-semibold">
                {pageUrl}
              </p>
            </div>
            <div
              className="rounded-2xl p-6 border-2 border-neutral-border shadow-soft"
              style={{
                background: backgroundType === "gradient"
                  ? `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`
                  : backgroundColor,
              }}
            >
              <div style={{ gap: spacing }} className="flex flex-col">
                {showProfileImage && profileImageUrl && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2"
                      style={{ borderColor: buttonColor }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                {title && (
                  <h2
                    className="font-bold"
                    style={{
                      color: textColor,
                      fontSize: `${titleFontSize * 0.5}px`,
                      textAlign: textAlignment,
                      fontFamily: fontFamily,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    style={{
                      color: textColor,
                      fontSize: `${descriptionFontSize * 0.5}px`,
                      textAlign: textAlignment,
                      fontFamily: fontFamily,
                      opacity: 0.8,
                    }}
                  >
                    {description}
                  </p>
                )}
                {pageLinks.length > 0 && (
                  <div style={{ gap: spacing * 0.5 }} className="flex flex-col">
                    {pageLinks.slice(0, 3).map((link, index) => (
                      <div
                        key={link.id}
                        className="text-center text-sm font-semibold"
                        style={{
                          backgroundColor: buttonColor,
                          color: buttonTextColor,
                          padding: `${buttonPadding * 0.5}px`,
                          borderRadius: `${buttonBorderRadius}px`,
                        }}
                      >
                        {link.title}
                      </div>
                    ))}
                    {pageLinks.length > 3 && (
                      <p
                        className="text-xs text-center opacity-60"
                        style={{ color: textColor, fontFamily: fontFamily }}
                      >
                        +{pageLinks.length - 3} more links
                      </p>
                    )}
                  </div>
                )}
                {pageLinks.length === 0 && (
                  <p
                    className="text-xs text-center opacity-60"
                    style={{ color: textColor, fontFamily: fontFamily }}
                  >
                    Add links to see preview
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-neutral-bg to-white rounded-2xl p-8 flex items-center justify-center h-64 border-2 border-neutral-border shadow-soft">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-electric-sapphire/60" />
              </div>
              <p className="text-sm font-semibold text-neutral-muted">Enter page details to see preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {createdPage && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Your Page is ready!"
          subtitle="Your custom landing page has been created successfully"
          shortUrl={createdPage ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${createdPage.slug}` : undefined}
          onCopy={handleCopyCode}
          onCustomize={() => {
            setShowSuccessModal(false);
            router.push(`/dashboard/pages/${createdPage.id}/edit`);
          }}
          onViewAnalytics={handleViewPage}
          createAnotherText="On a roll? Don't stop now! Create another page →"
          onCreateAnother={handleCreateAnother}
        />
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-bg transition-colors"
      >
        <span className="text-sm font-bold text-neutral-text">{title}</span>
        <ChevronDown className={cn(
          "h-4 w-4 text-neutral-muted transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && <div className="px-5 pb-5 animate-slide-reveal">{children}</div>}
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
        enabled ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-button",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
