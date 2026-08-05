"use client";

import { ExternalLink, Mail, Instagram, Linkedin, Github, Youtube, Facebook, Globe } from "lucide-react";
import { useState } from "react";
import { PageLayoutRenderer } from "@/components/page-layouts";
import { PageContentBlocks } from "@/components/page-layouts/page-content-blocks";
import type { PageBlock } from "@/lib/utils/page-blocks";
import { hasAnySocialLinks } from "@/lib/utils/social-links";
import { XSocialIcon } from "@/components/page-layouts/x-social-icon";

const socialIcons: Record<string, any> = {
  email: Mail,
  twitter: XSocialIcon,
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
      try {
        await fetch(`/api/pages/${page.id}/track-click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            link_id: linkId,
            page_id: page.id,
            referrer: typeof document !== "undefined" ? document.referrer : null,
          }),
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
  const blocks: PageBlock[] = Array.isArray(content.blocks) ? content.blocks : [];

  const fontFamily = content.fontFamily || "Inter";
  const titleFontSize = content.titleFontSize || 48;
  const descriptionFontSize = content.descriptionFontSize || 18;
  const titleFontWeight = content.titleFontWeight || 700;
  const descriptionFontWeight = content.descriptionFontWeight || 400;
  const buttonFontWeight = content.buttonFontWeight || 600;
  const buttonFontSize = content.buttonFontSize || 16;
  const buttonVariant = (["filled", "outlined", "soft", "glass"].includes(content.buttonVariant)
    ? content.buttonVariant
    : "filled") as "filled" | "outlined" | "soft" | "glass";
  const buttonShadow = (["none", "soft", "strong"].includes(content.buttonShadow)
    ? content.buttonShadow
    : "soft") as "none" | "soft" | "strong";
  const buttonTheme = (["solid", "soft", "outline", "pill", "glass", "flat"].includes(content.buttonTheme)
    ? content.buttonTheme
    : "solid") as "solid" | "soft" | "outline" | "pill" | "glass" | "flat";
  const buttonBorderRadius = content.buttonBorderRadius || 12;
  const buttonPadding = content.buttonPadding || 16;
  const textAlignment = content.textAlignment || "center";
  const buttonTextAlignment = (["left", "center", "right"].includes(content.buttonTextAlignment)
    ? content.buttonTextAlignment
    : textAlignment) as "left" | "center" | "right";
  const verticalAlign = content.verticalAlign === "center" ? "center" : "top";
  const spacing = content.spacing || 24;
  const linkGap = content.linkGap || 12;
  const maxContentWidth = content.maxContentWidth || 400;
  const backgroundType = content.backgroundType || "solid";
  const gradientColors = content.gradientColors || { start: "#FFFFFF", end: "#F3F4F6" };
  const backgroundImageUrl = content.backgroundImageUrl || "";
  const backgroundImageOpacity = content.backgroundImageOpacity ?? 1;
  const backgroundOverlayColor = content.backgroundOverlayColor || "#000000";
  const backgroundOverlayOpacity = content.backgroundOverlayOpacity ?? 0;
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
        className={`min-h-screen flex flex-col items-stretch relative overflow-hidden ${
          verticalAlign === "center" ? "justify-center" : "justify-start"
        }`}
        style={{
          backgroundColor:
            backgroundType === "gradient"
              ? undefined
              : page.background_color || "#FFFFFF",
          background:
            backgroundType === "gradient"
              ? `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`
              : undefined,
          color: page.text_color || "#000000",
          fontFamily: `"${fontFamily}", sans-serif`,
        }}
      >
        {backgroundType === "image" && backgroundImageUrl && (
          <>
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: `url("${backgroundImageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: backgroundImageOpacity,
              }}
              aria-hidden
            />
            {backgroundOverlayOpacity > 0 && (
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  backgroundColor: backgroundOverlayColor,
                  opacity: backgroundOverlayOpacity,
                }}
                aria-hidden
              />
            )}
          </>
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
          buttonFontSize={buttonFontSize}
          buttonVariant={buttonVariant}
          buttonShadow={buttonShadow}
          buttonTheme={buttonTheme}
          buttonTextAlignment={buttonTextAlignment}
          buttonBorderRadius={buttonBorderRadius}
          buttonPadding={buttonPadding}
          spacing={spacing}
          linkGap={linkGap}
          maxContentWidth={maxContentWidth}
          textAlignment={textAlignment as "left" | "center" | "right"}
          verticalAlign={verticalAlign}
          showProfileImage={showProfileImage}
          profileImageUrl={profileImageUrl}
          showBanner={
            showBanner &&
            ((bannerType === "text" && bannerText) ||
              (bannerType === "image" && bannerImageUrl))
          }
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

        {blocks.length > 0 && (
          <div className="relative z-10 w-full mx-auto px-5 sm:px-6 pb-8" style={{ maxWidth: `${maxContentWidth}px` }}>
            <PageContentBlocks
              pageId={page.id}
              blocks={blocks}
              textColor={page.text_color || "#000000"}
              buttonColor={page.button_color || "#3B82F6"}
              buttonTextColor={page.button_text_color || "#FFFFFF"}
              fontFamily={fontFamily}
              buttonBorderRadius={buttonBorderRadius}
              buttonPadding={buttonPadding}
              buttonFontSize={buttonFontSize}
              buttonFontWeight={buttonFontWeight}
              buttonVariant={buttonVariant}
              buttonShadow={buttonShadow}
              linkGap={linkGap}
              interactive
            />
          </div>
        )}

        {links.length === 0 &&
          blocks.length === 0 &&
          !hasAnySocialLinks(socialLinks) && (
            <div className="text-center py-16 px-6 opacity-60">
              <p
                style={{
                  color: page.text_color || "#000000",
                  fontFamily: `"${fontFamily}", sans-serif`,
                }}
              >
                No links added yet. Edit this page to add links.
              </p>
            </div>
          )}
      </div>
    </>
  );
}
