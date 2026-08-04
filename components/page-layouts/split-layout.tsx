import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface SplitLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** True two-column: portrait column | content column */
export function SplitLayout(props: SplitLayoutProps) {
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
      maxContentWidth={Math.max(maxContentWidth, 560)}
      spacing={spacing}
    >
      <div
        className={cn(
          "w-full grid gap-6 items-start",
          showProfileImage && profileImageUrl
            ? "grid-cols-1 sm:grid-cols-[minmax(140px,38%)_1fr]"
            : "grid-cols-1"
        )}
      >
        {showProfileImage && profileImageUrl && (
          <div className={cn(avatarOverlapClass(hasTopImage, "md"))}>
            <div
              className="w-full overflow-hidden rounded-2xl border-[3px] bg-white shadow-lg aspect-square sm:aspect-[4/5]"
              style={{ borderColor: buttonColor }}
            >
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex flex-col items-start min-w-0"
          style={{
            gap: `${Math.max(12, spacing * 0.7)}px`,
            paddingTop: hasTopImage ? 14 : 0,
          }}
        >
          {title && (
            <h1
              style={{
                fontSize: `${titleFontSize}px`,
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                fontWeight: titleFontWeight,
                lineHeight: 1.15,
                width: "100%",
                letterSpacing: "-0.02em",
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
                opacity: 0.74,
                lineHeight: 1.55,
                fontWeight: descriptionFontWeight,
                width: "100%",
              }}
            >
              {description}
            </p>
          )}
          <PageLinks
            pageLinks={pageLinks}
            textAlignment="left"
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            buttonTextColor={linkProps.buttonTextColor}
            onLinkClick={props.onLinkClick}
            {...linkProps}
          />
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
      </div>
    </LayoutShell>
  );
}
