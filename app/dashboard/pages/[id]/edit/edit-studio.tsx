"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Loader2, ChevronRight, Globe, Lock, Link2, Plus, X, 
  Mail, Twitter, Instagram, Linkedin, Github, Youtube, Facebook, 
  Palette, Type, Layout, Settings, Eye, Save, Monitor, Smartphone,
  GripVertical, ExternalLink, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { FontSelector } from "@/components/font-selector";
import { ColorPickerWithInput } from "@/components/color-picker-with-input";
import { SliderWithInput } from "@/components/slider-with-input";
import { GradientTemplates } from "@/components/gradient-templates";
import { PageThemes, PageTheme } from "@/components/page-themes";
import { LayoutTemplates } from "@/components/layout-templates";
import { CustomDomains } from "@/components/custom-domains";
import { PageLayoutRenderer } from "@/components/page-layouts";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export default function EditStudio({ page, userLinks }: { page: any; userLinks?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Form state - initialized from page
  const [slug, setSlug] = useState(page.slug || "");
  const [title, setTitle] = useState(page.title || "");
  const [description, setDescription] = useState(page.description || "");
  const [isPublic, setIsPublic] = useState(page.is_public ?? true);

  // Links state - initialized from page
  const [pageLinks, setPageLinks] = useState<LinkItem[]>(
    Array.isArray(page.links) ? page.links : []
  );
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Social links state - initialized from page
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    page.social_links || {}
  );

  // Design state - initialized from page
  const [backgroundColor, setBackgroundColor] = useState(page.background_color || "#FFFFFF");
  const [textColor, setTextColor] = useState(page.text_color || "#000000");
  const [buttonColor, setButtonColor] = useState(page.button_color || "#3B82F6");
  const [buttonTextColor, setButtonTextColor] = useState(page.button_text_color || "#FFFFFF");
  
  // Advanced customization state - initialized from page content
  const pageContent = page.content || {};
  const [fontFamily, setFontFamily] = useState(pageContent.fontFamily || "Inter");
  const [titleFontSize, setTitleFontSize] = useState(pageContent.titleFontSize || 48);
  const [descriptionFontSize, setDescriptionFontSize] = useState(pageContent.descriptionFontSize || 18);
  const [buttonBorderRadius, setButtonBorderRadius] = useState(pageContent.buttonBorderRadius || 12);
  const [buttonPadding, setButtonPadding] = useState(pageContent.buttonPadding || 16);
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">(pageContent.textAlignment || "center");
  const [spacing, setSpacing] = useState(pageContent.spacing || 24);
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | "image">(pageContent.backgroundType || "solid");
  const [gradientColors, setGradientColors] = useState(pageContent.gradientColors || { start: "#FFFFFF", end: "#F3F4F6" });
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(pageContent.backgroundImageUrl || "");
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(pageContent.backgroundImageOpacity ?? 1);
  const [profileImageUrl, setProfileImageUrl] = useState(pageContent.profileImageUrl || "");
  const [showProfileImage, setShowProfileImage] = useState(pageContent.showProfileImage || false);
  
  // Banner customization
  const [showBanner, setShowBanner] = useState(pageContent.showBanner || false);
  const [bannerText, setBannerText] = useState(pageContent.bannerText || "");
  const [bannerImageUrl, setBannerImageUrl] = useState(pageContent.bannerImageUrl || "");
  const [bannerUrl, setBannerUrl] = useState(pageContent.bannerUrl || "");
  const [bannerStyle, setBannerStyle] = useState<"info" | "success" | "warning" | "error">(pageContent.bannerStyle || "info");
  const [bannerPosition, setBannerPosition] = useState<"top" | "bottom">(pageContent.bannerPosition || "top");
  const [bannerType, setBannerType] = useState<"text" | "image">(pageContent.bannerType || "text");
  
  // Layout template
  const [layoutTemplate, setLayoutTemplate] = useState<"centered" | "left" | "card" | "split" | "minimal" | "hero" | "sidebar" | "grid" | "magazine">(pageContent.layoutTemplate || "centered");
  
  // Social icons customization
  const [socialIconSize, setSocialIconSize] = useState(pageContent.socialIconSize || 20);
  const [socialIconStyle, setSocialIconStyle] = useState<"filled" | "outlined" | "minimal">(pageContent.socialIconStyle || "outlined");
  const [socialIconShape, setSocialIconShape] = useState<"circle" | "square" | "rounded">(pageContent.socialIconShape || "circle");
  const [socialIconPadding, setSocialIconPadding] = useState(pageContent.socialIconPadding || 8);
  const [socialIconGap, setSocialIconGap] = useState(pageContent.socialIconGap || 12);
  
  // Additional customizations
  const [titleFontWeight, setTitleFontWeight] = useState(pageContent.titleFontWeight || 700);
  const [descriptionFontWeight, setDescriptionFontWeight] = useState(pageContent.descriptionFontWeight || 400);
  const [buttonFontWeight, setButtonFontWeight] = useState(pageContent.buttonFontWeight || 600);
  const [linkGap, setLinkGap] = useState(pageContent.linkGap || 12);
  const [maxContentWidth, setMaxContentWidth] = useState(pageContent.maxContentWidth || 400);

  // Studio tabs
  const [activeTab, setActiveTab] = useState<"content" | "design" | "typography" | "layout" | "settings">("content");
  
  // Design tab collapsible sections
  const [designSections, setDesignSections] = useState({
    themes: true,
    background: false,
    colors: false,
    buttons: false,
    socialIcons: false,
  });

  // Apply theme
  const handleThemeSelect = (theme: PageTheme) => {
    setBackgroundType(theme.settings.backgroundType);
    setBackgroundColor(theme.settings.backgroundColor);
    if (theme.settings.gradientColors) {
      setGradientColors(theme.settings.gradientColors);
    }
    setTextColor(theme.settings.textColor);
    setButtonColor(theme.settings.buttonColor);
    setButtonTextColor(theme.settings.buttonTextColor);
    setFontFamily(theme.settings.fontFamily);
    setTitleFontSize(theme.settings.titleFontSize);
    setDescriptionFontSize(theme.settings.descriptionFontSize);
    setTitleFontWeight(theme.settings.titleFontWeight);
    setDescriptionFontWeight(theme.settings.descriptionFontWeight);
    setButtonFontWeight(theme.settings.buttonFontWeight);
    setButtonBorderRadius(theme.settings.buttonBorderRadius);
    setButtonPadding(theme.settings.buttonPadding);
    setSocialIconStyle(theme.settings.socialIconStyle);
    setSocialIconShape(theme.settings.socialIconShape);
    toast.success(`Applied ${theme.name} theme`);
  };

  // Load Google Fonts dynamically
  useEffect(() => {
    const googleFonts = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Playfair Display", "Merriweather", "Raleway", "Nunito"];
    
    if (googleFonts.includes(fontFamily)) {
      const fontName = fontFamily.replace(/\s+/g, "+");
      const linkId = `google-font-${fontName}`;
      
      // Remove existing font link if any
      const existingLink = document.getElementById(linkId);
      if (existingLink) {
        existingLink.remove();
      }
      
      // Create new font link
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      
      return () => {
        const linkToRemove = document.getElementById(linkId);
        if (linkToRemove) {
          linkToRemove.remove();
        }
      };
    }
  }, [fontFamily]);

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    if (draggedIndex !== index) {
      const newLinks = [...pageLinks];
      const draggedItem = newLinks[draggedIndex];
      newLinks.splice(draggedIndex, 1);
      newLinks.splice(index, 0, draggedItem);
      setPageLinks(newLinks);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
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
            titleFontWeight,
            descriptionFontWeight,
            buttonFontWeight,
            buttonBorderRadius,
            buttonPadding,
            textAlignment,
            spacing,
            linkGap,
            maxContentWidth,
            backgroundType,
            gradientColors,
            profileImageUrl: showProfileImage ? profileImageUrl : "",
            showProfileImage,
            showBanner,
            bannerText,
            bannerImageUrl,
            bannerUrl,
            bannerStyle,
            bannerPosition,
            bannerType,
            layoutTemplate,
            socialIconSize,
            socialIconStyle,
            socialIconShape,
            socialIconPadding,
            socialIconGap,
            backgroundImageUrl,
            backgroundImageOpacity,
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
        throw new Error(errorData.error || "Failed to update page");
      }

      toast.success("Page updated successfully!");
      // Stay in studio - no redirect
    } catch (err: any) {
      setError(err.message || "Failed to update page");
      toast.error(err.message || "Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  const pageUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${slug}` : "";

  return (
    <div className="flex h-[calc(100vh-73px)] bg-neutral-bg">
      {/* Left Panel - Controls */}
      <div className="w-96 bg-white border-r border-neutral-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-border">
          <h1 className="text-2xl font-bold text-neutral-text mb-1">Page Studio</h1>
          <p className="text-sm text-neutral-muted">Edit your custom landing page</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-border bg-neutral-bg/50">
          {[
            { id: "content", label: "Content", icon: FileText },
            { id: "design", label: "Design", icon: Palette },
            { id: "typography", label: "Typography", icon: Type },
            { id: "layout", label: "Layout", icon: Layout },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 px-3 py-3 text-xs font-semibold transition-colors border-b-2",
                  activeTab === tab.id
                    ? "text-electric-sapphire border-electric-sapphire bg-white"
                    : "text-neutral-muted border-transparent hover:text-neutral-text"
                )}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <div className="hidden sm:block">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* Tab Content - Same as PageStudio but with update button */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Content Tab - Same content as PageStudio */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Page Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-muted font-mono px-3 py-2 bg-neutral-bg rounded-lg border border-neutral-border">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setSlug(value);
                      }}
                      placeholder="my-page"
                      required
                      className="flex-1 h-10 px-3 rounded-lg border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    />
                  </div>
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
                    className="w-full h-10 px-3 rounded-lg border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border-2 border-neutral-border bg-white text-neutral-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                  />
                </div>

                {/* Links Section with Drag & Drop */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
                      Links ({pageLinks.length})
                    </label>
                    {!showAddLink && (
                      <button
                        type="button"
                        onClick={() => setShowAddLink(true)}
                        className="text-xs text-electric-sapphire hover:text-bright-indigo font-semibold flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    )}
                  </div>

                  {showAddLink && (
                    <div className="p-3 rounded-lg border-2 border-neutral-border bg-neutral-bg space-y-2 mb-3">
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Link title"
                        className="w-full h-9 px-3 rounded-lg border border-neutral-border bg-white text-sm text-neutral-text font-medium"
                      />
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full h-9 px-3 rounded-lg border border-neutral-border bg-white text-sm text-neutral-text font-medium"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCustomLink}
                          className="flex-1 h-9 px-3 rounded-lg bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-xs font-semibold"
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
                          className="h-9 px-3 rounded-lg border border-neutral-border text-neutral-text text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {userLinks && userLinks.length > 0 && (
                    <div className="mb-3 max-h-32 overflow-y-auto space-y-1">
                      {userLinks
                        .filter(link => !pageLinks.some(pl => pl.id === link.id))
                        .map((link) => (
                          <button
                            key={link.id}
                            type="button"
                            onClick={() => handleAddExistingLink(link)}
                            className="w-full flex items-center justify-between p-2 rounded-lg border border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5 transition-all text-left text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-neutral-text truncate">
                                {link.title || link.short_code}
                              </div>
                            </div>
                            <Plus className="h-3 w-3 text-electric-sapphire flex-shrink-0 ml-2" />
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {pageLinks.map((link, index) => (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border-2 bg-white cursor-move",
                          draggedIndex === index ? "border-electric-sapphire opacity-50" : "border-neutral-border"
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-neutral-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-neutral-text truncate">
                            {link.title}
                          </div>
                          <div className="text-xs text-neutral-muted truncate">
                            {link.url}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="p-1 rounded hover:bg-red-50 text-neutral-muted hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
                      Social Links
                    </label>
                  </div>
                  <div className="space-y-2">
                    {["email", "twitter", "instagram", "linkedin", "github", "youtube", "facebook", "website"].map((platform) => (
                      <input
                        key={platform}
                        type={platform === "email" ? "email" : "url"}
                        value={socialLinks[platform] || ""}
                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                        placeholder={platform === "email" ? "your@email.com" : `${platform}.com/yourprofile`}
                        className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === "design" && (
              <div className="space-y-4">
                {/* Themes Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setDesignSections({ ...designSections, themes: !designSections.themes })}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-bg transition-colors"
                  >
                    <span className="text-sm font-bold text-neutral-text">Themes</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-neutral-muted transition-transform duration-200",
                      designSections.themes && "rotate-180"
                    )} />
                  </button>
                  {designSections.themes && (
                    <div className="px-4 pb-4 animate-slide-reveal">
                      <PageThemes
                        onSelect={handleThemeSelect}
                        currentTheme={{
                          backgroundType: backgroundType === "image" ? "solid" : backgroundType as "solid" | "gradient",
                          backgroundColor,
                          textColor,
                          buttonColor,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Background Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setDesignSections({ ...designSections, background: !designSections.background })}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-bg transition-colors"
                  >
                    <span className="text-sm font-bold text-neutral-text">Background</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-neutral-muted transition-transform duration-200",
                      designSections.background && "rotate-180"
                    )} />
                  </button>
                  {designSections.background && (
                    <div className="px-4 pb-4 space-y-4 animate-slide-reveal">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                          Background Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setBackgroundType("solid")}
                            className={cn(
                              "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all",
                              backgroundType === "solid"
                                ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                            )}
                          >
                            Solid
                          </button>
                          <button
                            type="button"
                            onClick={() => setBackgroundType("gradient")}
                            className={cn(
                              "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all",
                              backgroundType === "gradient"
                                ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                            )}
                          >
                            Gradient
                          </button>
                          <button
                            type="button"
                            onClick={() => setBackgroundType("image")}
                            className={cn(
                              "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all",
                              backgroundType === "image"
                                ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                            )}
                          >
                            Image
                          </button>
                        </div>
                      </div>

                      {backgroundType === "solid" ? (
                        <ColorPickerWithInput
                          label="Background Color"
                          value={backgroundColor}
                          onChange={setBackgroundColor}
                        />
                      ) : backgroundType === "gradient" ? (
                        <div className="space-y-4">
                          <GradientTemplates
                            onSelect={(start, end) => setGradientColors({ start, end })}
                            currentStart={gradientColors.start}
                            currentEnd={gradientColors.end}
                          />
                          <div className="space-y-3">
                            <ColorPickerWithInput
                              label="Gradient Start Color"
                              value={gradientColors.start}
                              onChange={(color) => setGradientColors({ ...gradientColors, start: color })}
                            />
                            <ColorPickerWithInput
                              label="Gradient End Color"
                              value={gradientColors.end}
                              onChange={(color) => setGradientColors({ ...gradientColors, end: color })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                              Background Image URL
                            </label>
                            <input
                              type="url"
                              value={backgroundImageUrl}
                              onChange={(e) => setBackgroundImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                            />
                            <p className="text-xs text-neutral-muted mt-1">
                              Enter the URL of your background image
                            </p>
                          </div>
                          <SliderWithInput
                            label="Image Opacity"
                            value={backgroundImageOpacity}
                            onChange={setBackgroundImageOpacity}
                            min={0.1}
                            max={1}
                          />
                          <ColorPickerWithInput
                            label="Overlay Color (optional)"
                            value={backgroundColor}
                            onChange={setBackgroundColor}
                          />
                          <p className="text-xs text-neutral-muted -mt-2">
                            Add a color overlay on top of the image
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Colors Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setDesignSections({ ...designSections, colors: !designSections.colors })}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-bg transition-colors"
                  >
                    <span className="text-sm font-bold text-neutral-text">Colors</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-neutral-muted transition-transform duration-200",
                      designSections.colors && "rotate-180"
                    )} />
                  </button>
                  {designSections.colors && (
                    <div className="px-4 pb-4 space-y-4 animate-slide-reveal">
                      <ColorPickerWithInput
                        label="Text Color"
                        value={textColor}
                        onChange={setTextColor}
                      />
                      <ColorPickerWithInput
                        label="Button Color"
                        value={buttonColor}
                        onChange={setButtonColor}
                      />
                      <ColorPickerWithInput
                        label="Button Text Color"
                        value={buttonTextColor}
                        onChange={setButtonTextColor}
                      />
                    </div>
                  )}
                </div>

                {/* Buttons Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setDesignSections({ ...designSections, buttons: !designSections.buttons })}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-bg transition-colors"
                  >
                    <span className="text-sm font-bold text-neutral-text">Buttons</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-neutral-muted transition-transform duration-200",
                      designSections.buttons && "rotate-180"
                    )} />
                  </button>
                  {designSections.buttons && (
                    <div className="px-4 pb-4 space-y-4 animate-slide-reveal">
                      <SliderWithInput
                        label="Button Border Radius"
                        value={buttonBorderRadius}
                        onChange={setButtonBorderRadius}
                        min={0}
                        max={50}
                      />
                      <SliderWithInput
                        label="Button Padding"
                        value={buttonPadding}
                        onChange={setButtonPadding}
                        min={8}
                        max={32}
                      />
                    </div>
                  )}
                </div>

                {/* Social Icons Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
                  <button
                    type="button"
                    onClick={() => setDesignSections({ ...designSections, socialIcons: !designSections.socialIcons })}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-bg transition-colors"
                  >
                    <span className="text-sm font-bold text-neutral-text">Social Icons</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-neutral-muted transition-transform duration-200",
                      designSections.socialIcons && "rotate-180"
                    )} />
                  </button>
                  {designSections.socialIcons && (
                    <div className="px-4 pb-4 space-y-4 animate-slide-reveal">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                          Icon Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["filled", "outlined", "minimal"] as const).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setSocialIconStyle(style)}
                              className={cn(
                                "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
                                socialIconStyle === style
                                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                  : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                              )}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                          Icon Shape
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["circle", "square", "rounded"] as const).map((shape) => (
                            <button
                              key={shape}
                              type="button"
                              onClick={() => setSocialIconShape(shape)}
                              className={cn(
                                "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
                                socialIconShape === shape
                                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                  : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                              )}
                            >
                              {shape}
                            </button>
                          ))}
                        </div>
                      </div>

                      <SliderWithInput
                        label="Icon Size"
                        value={socialIconSize}
                        onChange={setSocialIconSize}
                        min={16}
                        max={64}
                      />
                      <SliderWithInput
                        label="Icon Padding"
                        value={socialIconPadding}
                        onChange={setSocialIconPadding}
                        min={0}
                        max={20}
                      />
                      <SliderWithInput
                        label="Gap Between Icons"
                        value={socialIconGap}
                        onChange={setSocialIconGap}
                        min={4}
                        max={32}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "typography" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Font Family
                  </label>
                  <FontSelector
                    value={fontFamily}
                    onChange={setFontFamily}
                  />
                </div>

                <SliderWithInput
                  label="Title Font Size"
                  value={titleFontSize}
                  onChange={setTitleFontSize}
                  min={24}
                  max={72}
                />

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Title Font Weight
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[400, 500, 600, 700, 800].map((weight) => (
                      <button
                        key={weight}
                        type="button"
                        onClick={() => setTitleFontWeight(weight)}
                        className={cn(
                          "h-9 px-2 rounded-lg border-2 text-xs font-semibold transition-all",
                          titleFontWeight === weight
                            ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                            : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                        )}
                        style={{ fontWeight: weight }}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>

                <SliderWithInput
                  label="Description Font Size"
                  value={descriptionFontSize}
                  onChange={setDescriptionFontSize}
                  min={12}
                  max={32}
                />

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Description Font Weight
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[400, 500, 600, 700].map((weight) => (
                      <button
                        key={weight}
                        type="button"
                        onClick={() => setDescriptionFontWeight(weight)}
                        className={cn(
                          "h-9 px-2 rounded-lg border-2 text-xs font-semibold transition-all",
                          descriptionFontWeight === weight
                            ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                            : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                        )}
                        style={{ fontWeight: weight }}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Button Font Weight
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[400, 500, 600, 700].map((weight) => (
                      <button
                        key={weight}
                        type="button"
                        onClick={() => setButtonFontWeight(weight)}
                        className={cn(
                          "h-9 px-2 rounded-lg border-2 text-xs font-semibold transition-all",
                          buttonFontWeight === weight
                            ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                            : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                        )}
                        style={{ fontWeight: weight }}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="space-y-6">
                <LayoutTemplates
                  onSelect={setLayoutTemplate}
                  currentTemplate={layoutTemplate}
                />

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Text Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setTextAlignment(align)}
                        className={cn(
                          "h-10 px-3 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
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

                <SliderWithInput
                  label="Spacing Between Elements"
                  value={spacing}
                  onChange={setSpacing}
                  min={8}
                  max={64}
                />

                <SliderWithInput
                  label="Gap Between Links"
                  value={linkGap}
                  onChange={setLinkGap}
                  min={4}
                  max={32}
                />

                <SliderWithInput
                  label="Max Content Width"
                  value={maxContentWidth}
                  onChange={setMaxContentWidth}
                  min={300}
                  max={800}
                />
                <p className="text-xs text-neutral-muted -mt-4">
                  Maximum width of your page content in pixels
                </p>

                <div className="p-4 rounded-lg bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Profile Image</div>
                      <div className="text-xs text-neutral-muted">Add a profile picture or logo</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProfileImage(!showProfileImage)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        showProfileImage ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                          showProfileImage ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  {showProfileImage && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-sm text-neutral-text font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40"
                      />
                      <p className="text-xs text-neutral-muted">
                        Enter the URL of your profile image or logo
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Banner</div>
                      <div className="text-xs text-neutral-muted">Add a banner message</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBanner(!showBanner)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        showBanner ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                          showBanner ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                  {showBanner && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                          Banner Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["text", "image"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setBannerType(type)}
                              className={cn(
                                "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
                                bannerType === type
                                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                  : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {bannerType === "text" ? (
                        <>
                          <input
                            type="text"
                            value={bannerText}
                            onChange={(e) => setBannerText(e.target.value)}
                            placeholder="Banner message..."
                            className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-sm text-neutral-text font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40"
                          />
                          <div>
                            <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                              Banner Style
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {(["info", "success", "warning", "error"] as const).map((style) => (
                                <button
                                  key={style}
                                  type="button"
                                  onClick={() => setBannerStyle(style)}
                                  className={cn(
                                    "h-9 px-2 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
                                    bannerStyle === style
                                      ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                      : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                                  )}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <input
                          type="url"
                          value={bannerImageUrl}
                          onChange={(e) => setBannerImageUrl(e.target.value)}
                          placeholder="https://example.com/banner-image.jpg"
                          className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-sm text-neutral-text font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40"
                        />
                      )}

                      <input
                        type="url"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="Optional link URL (optional)"
                        className="w-full h-9 px-3 rounded-lg border-2 border-neutral-border bg-white text-sm text-neutral-text font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40"
                      />
                      
                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                          Banner Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["top", "bottom"] as const).map((position) => (
                            <button
                              key={position}
                              type="button"
                              onClick={() => setBannerPosition(position)}
                              className={cn(
                                "h-9 px-3 rounded-lg border-2 text-xs font-semibold transition-all capitalize",
                                bannerPosition === position
                                  ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white border-electric-sapphire"
                                  : "bg-white text-neutral-text border-neutral-border hover:bg-neutral-bg"
                              )}
                            >
                              {position}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Public Page</div>
                      <div className="text-xs text-neutral-muted">
                        {isPublic ? "Anyone can view" : "Only you can view"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        isPublic ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                          isPublic ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-border pt-6">
                  <CustomDomains pageId={page.id} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-border">
              <button
                type="submit"
                disabled={loading || !slug || !title}
                className={cn(
                  "w-full h-11 rounded-lg bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-all flex items-center justify-center gap-2"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Live Preview - Same as PageStudio */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-bg">
        <div className="p-4 border-b border-neutral-border bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-neutral-muted" />
            <h2 className="text-lg font-semibold text-neutral-text">Live Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                previewDevice === "desktop"
                  ? "bg-electric-sapphire/10 text-electric-sapphire"
                  : "text-neutral-muted hover:bg-neutral-bg"
              )}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                previewDevice === "mobile"
                  ? "bg-electric-sapphire/10 text-electric-sapphire"
                  : "text-neutral-muted hover:bg-neutral-bg"
              )}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div
            className="min-h-full w-full flex flex-col items-center justify-center p-8 relative"
            style={{
              background: backgroundType === "image" && backgroundImageUrl
                ? `url(${backgroundImageUrl})`
                : backgroundType === "gradient"
                ? `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`
                : backgroundColor,
              backgroundSize: backgroundType === "image" ? "cover" : undefined,
              backgroundPosition: backgroundType === "image" ? "center" : undefined,
              backgroundRepeat: backgroundType === "image" ? "no-repeat" : undefined,
              color: textColor,
              fontFamily: `"${fontFamily}", sans-serif`,
              gap: `${spacing}px`,
            }}
          >
            {backgroundType === "image" && backgroundImageUrl && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: backgroundColor,
                  opacity: backgroundImageOpacity,
                }}
              />
            )}
            <PageLayoutRenderer
              layoutTemplate={layoutTemplate}
              title={title}
              description={description}
              pageLinks={pageLinks}
              socialLinks={socialLinks}
              fontFamily={fontFamily}
              textColor={textColor}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
              titleFontSize={titleFontSize}
              descriptionFontSize={descriptionFontSize}
              titleFontWeight={titleFontWeight}
              descriptionFontWeight={descriptionFontWeight}
              buttonFontWeight={buttonFontWeight}
              buttonBorderRadius={buttonBorderRadius}
              buttonPadding={buttonPadding}
              spacing={spacing}
              linkGap={linkGap}
              maxContentWidth={maxContentWidth}
              textAlignment={textAlignment}
              showProfileImage={showProfileImage}
              profileImageUrl={profileImageUrl}
              showBanner={showBanner && ((bannerType === "text" && bannerText) || (bannerType === "image" && bannerImageUrl))}
              bannerText={bannerText}
              bannerImageUrl={bannerImageUrl}
              bannerUrl={bannerUrl}
              bannerStyle={bannerStyle}
              bannerPosition={bannerPosition}
              bannerType={bannerType}
              socialIconSize={socialIconSize}
              socialIconStyle={socialIconStyle}
              socialIconShape={socialIconShape}
              socialIconPadding={socialIconPadding}
              socialIconGap={socialIconGap}
              socialIcons={{
                email: Mail,
                twitter: Twitter,
                instagram: Instagram,
                linkedin: Linkedin,
                github: Github,
                youtube: Youtube,
                facebook: Facebook,
                website: Globe,
              }}
              Globe={Globe}
              ExternalLink={ExternalLink}
            />
            {pageLinks.length === 0 && Object.keys(socialLinks).filter(key => socialLinks[key]).length === 0 && (
              <p style={{ color: textColor, fontFamily: `"${fontFamily}", sans-serif`, opacity: 0.6 }}>
                Add links to see preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

