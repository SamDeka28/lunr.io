"use client";

import { ExternalLink, Mail, Twitter, Instagram, Linkedin, Github, Youtube, Facebook, Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { PageLayoutRenderer } from "@/components/page-layouts";

const socialIcons: Record<string, any> = {
  email: Mail,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  facebook: Facebook,
  website: Globe,
};

export default function PublicPageViewer({ page }: { page: any }) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  const handleLinkClick = async (linkId: string, url: string) => {
    if (!clickedLinks.has(linkId)) {
      setClickedLinks(new Set([...clickedLinks, linkId]));
      // Track click on the page via API
      try {
        await fetch(`/api/pages/${page.id}/track-click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to track click:", err);
      }
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const links = Array.isArray(page.links) ? page.links : [];
  const socialLinks = page.social_links || {};
  const content = page.content || {};
  
  // Extract customization options from content
  const fontFamily = content.fontFamily || "Inter";
  const titleFontSize = content.titleFontSize || 48;
  const descriptionFontSize = content.descriptionFontSize || 18;
  const titleFontWeight = content.titleFontWeight || 700;
  const descriptionFontWeight = content.descriptionFontWeight || 400;
  const buttonFontWeight = content.buttonFontWeight || 600;
  const buttonBorderRadius = content.buttonBorderRadius || 12;
  const buttonPadding = content.buttonPadding || 16;
  const textAlignment = content.textAlignment || "center";
  const spacing = content.spacing || 24;
  const linkGap = content.linkGap || 12;
  const maxContentWidth = content.maxContentWidth || 400;
  const backgroundType = content.backgroundType || "solid";
  const gradientColors = content.gradientColors || { start: "#FFFFFF", end: "#F3F4F6" };
  const backgroundImageUrl = content.backgroundImageUrl || "";
  const backgroundImageOpacity = content.backgroundImageOpacity ?? 1;
  const profileImageUrl = content.profileImageUrl || "";
  const showProfileImage = content.showProfileImage || false;
  const socialIconSize = content.socialIconSize || 20;
  const socialIconStyle = content.socialIconStyle || "outlined";
  const socialIconShape = content.socialIconShape || "circle";
  const socialIconPadding = content.socialIconPadding || 8;
  const socialIconGap = content.socialIconGap || 12;
  const showBanner = content.showBanner || false;
  const bannerText = content.bannerText || "";
  const bannerImageUrl = content.bannerImageUrl || "";
  const bannerUrl = content.bannerUrl || "";
  const bannerStyle = content.bannerStyle || "info";
  const bannerPosition = content.bannerPosition || "top";
  const bannerType = content.bannerType || "text";
  const layoutTemplate = content.layoutTemplate || "centered";

  // Load Google Fonts if needed
  const googleFonts = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Playfair Display", "Merriweather", "Raleway", "Nunito"];
  const fontName = fontFamily.replace(/\s+/g, "+");

  return (
    <>
      {googleFonts.includes(fontFamily) && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`}
          rel="stylesheet"
        />
      )}
    <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
        style={{
          background: backgroundType === "image" && backgroundImageUrl
            ? `url(${backgroundImageUrl})`
            : backgroundType === "gradient"
            ? `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`
            : page.background_color || "#FFFFFF",
          backgroundSize: backgroundType === "image" ? "cover" : undefined,
          backgroundPosition: backgroundType === "image" ? "center" : undefined,
          backgroundRepeat: backgroundType === "image" ? "no-repeat" : undefined,
          color: page.text_color || "#000000",
          fontFamily: `"${fontFamily}", sans-serif`,
          gap: `${spacing}px`,
        }}
      >
        {backgroundType === "image" && backgroundImageUrl && (
          <div
            className="absolute inset-0 z-0"
      style={{
        backgroundColor: page.background_color || "#FFFFFF",
              opacity: backgroundImageOpacity,
            }}
          />
        )}
        <PageLayoutRenderer
          layoutTemplate={layoutTemplate as any}
          title={page.title}
          description={page.description}
          pageLinks={links.map((link: any, index: number) => ({
            id: link.id || `link-${index}`,
            title: link.title || link.url,
            url: link.url,
          }))}
          socialLinks={socialLinks}
          fontFamily={fontFamily}
          textColor={page.text_color || "#000000"}
          buttonColor={page.button_color || "#3B82F6"}
          buttonTextColor={page.button_text_color || "#FFFFFF"}
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
          textAlignment={textAlignment as "left" | "center" | "right"}
          showProfileImage={showProfileImage}
          profileImageUrl={profileImageUrl}
          showBanner={showBanner && ((bannerType === "text" && bannerText) || (bannerType === "image" && bannerImageUrl))}
          bannerText={bannerText}
          bannerImageUrl={bannerImageUrl}
          bannerUrl={bannerUrl}
          bannerStyle={bannerStyle as "info" | "success" | "warning" | "error"}
          bannerPosition={bannerPosition as "top" | "bottom"}
          bannerType={bannerType as "text" | "image"}
          socialIconSize={socialIconSize}
          socialIconStyle={socialIconStyle as "filled" | "outlined" | "minimal"}
          socialIconShape={socialIconShape as "circle" | "square" | "rounded"}
          socialIconPadding={socialIconPadding}
          socialIconGap={socialIconGap}
          socialIcons={socialIcons}
          Globe={Globe}
          ExternalLink={ExternalLink}
          onLinkClick={handleLinkClick}
        />
        {links.length === 0 && Object.keys(socialLinks).filter(key => socialLinks[key]).length === 0 && (
          <div className="text-center py-12 opacity-60">
            <p style={{ color: page.text_color || "#000000", fontFamily: `"${fontFamily}", sans-serif` }}>
              No links added yet. Edit this page to add links.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

