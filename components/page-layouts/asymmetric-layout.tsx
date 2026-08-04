import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface AsymmetricLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Offset portrait + left-aligned copy — clearly not a centered stack */
export function AsymmetricLayout(props: AsymmetricLayoutProps) {
  const {
    title,
    description,
    pageLinks,
    socialLinks,
    showBanner,
    bannerText,
    bannerImageUrl,
    bannerUrl,
    bannerStyle,
    bannerPosition,
    bannerType,
    showProfileImage,
    profileImageUrl,
    buttonColor,
    spacing,
    maxContentWidth,
    fontFamily,
    textColor,
    titleFontSize,
    descriptionFontSize,
    titleFontWeight,
    descriptionFontWeight,
    socialIcons,
    Globe,
    ExternalLink,
    ...linkProps
  } = props;

  const hasTopImage =
    showBanner && bannerPosition === "top" && bannerType === "image" && !!bannerImageUrl;

  return (
    <LayoutShell
      showBanner={showBanner}
      bannerText={bannerText}
      bannerImageUrl={bannerImageUrl}
      bannerUrl={bannerUrl}
      bannerStyle={bannerStyle}
      bannerPosition={bannerPosition}
      bannerType={bannerType}
      maxContentWidth={Math.max(maxContentWidth, 520)}
      spacing={spacing}
    >
      <div className="w-full flex flex-row gap-5 items-start">
        {showProfileImage && profileImageUrl && (
          <div className={cn("flex-shrink-0", avatarOverlapClass(hasTopImage, "md"))}>
            <img
              src={profileImageUrl}
              alt="Profile"
              className="object-cover rounded-2xl border-[3px] bg-white shadow-lg"
              style={{
                width: 128,
                height: 128,
                borderColor: buttonColor,
                transform: "rotate(-2deg)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        {/* Text stays on page background — pad past the banner fold */}
        <div
          className="flex-1 flex flex-col items-start min-w-0"
          style={{
            gap: `${Math.max(10, spacing * 0.6)}px`,
            paddingTop: hasTopImage ? 12 : 4,
          }}
        >
          {title && (
            <h1
              style={{
                fontSize: `${titleFontSize * 1.08}px`,
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                fontWeight: titleFontWeight,
                lineHeight: 1.12,
                width: "100%",
                letterSpacing: "-0.025em",
              }}
            >
              {title}
            </h1>
          )}
          {description && (
            <p
              style={{
                fontSize: `${descriptionFontSize}px`,
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                opacity: 0.72,
                lineHeight: 1.55,
                fontWeight: descriptionFontWeight,
                width: "100%",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Links full-width below the header row — asymmetric signature */}
      <div className="w-full" style={{ marginTop: 4 }}>
        <PageLinks
          pageLinks={pageLinks}
          textAlignment="left"
          ExternalLink={ExternalLink}
          buttonColor={buttonColor}
          buttonTextColor={linkProps.buttonTextColor}
          onLinkClick={props.onLinkClick}
          {...linkProps}
        />
      </div>
      <div className="w-full flex justify-start">
        <SocialIcons
          socialLinks={socialLinks}
          socialIcons={socialIcons}
          textColor={textColor}
          buttonColor={buttonColor}
          buttonTextColor={linkProps.buttonTextColor}
          Globe={Globe}
          {...linkProps}
        />
      </div>
    </LayoutShell>
  );
}
