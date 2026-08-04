import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";
import { fluidBody, fluidSpace, fluidTitle } from "@/lib/utils/fluid-type";

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
      verticalAlign={props.verticalAlign}
>
      <div
        className={cn(
          "w-full grid gap-5 sm:gap-6 items-start",
          showProfileImage && profileImageUrl
            ? "grid-cols-[minmax(110px,38%)_1fr]"
            : "grid-cols-1"
        )}
      >
        {showProfileImage && profileImageUrl && (
          <div className={cn(avatarOverlapClass(hasTopImage, "md"))}>
            <div
              className="w-full overflow-hidden rounded-2xl border-[3px] bg-white shadow-lg aspect-[4/5]"
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
            gap: fluidSpace(Math.max(12, spacing * 0.7)),
            paddingTop: hasTopImage ? 10 : 0,
          }}
        >
          {title && (
            <h1
              className="break-words"
              style={{
                fontSize: fluidTitle(titleFontSize),
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
              className="break-words"
              style={{
                fontSize: fluidBody(descriptionFontSize),
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
            {...linkProps}
            pageLinks={pageLinks}
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            fontFamily={fontFamily}
            onLinkClick={props.onLinkClick}
          />
          <SocialIcons
            {...linkProps}
            socialLinks={socialLinks}
            socialIcons={socialIcons}
            textColor={textColor}
            buttonColor={buttonColor}
            Globe={Globe}
          />
        </div>
      </div>
    </LayoutShell>
  );
}
