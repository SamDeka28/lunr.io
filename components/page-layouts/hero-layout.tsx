import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface HeroLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Large avatar + oversized type — title always below the banner */
export function HeroLayout(props: HeroLayoutProps) {
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
      maxContentWidth={maxContentWidth}
      spacing={Math.max(14, spacing * 0.8)}
      contentClassName="items-center text-center"
    >
      {showProfileImage && profileImageUrl && (
        <div className={cn("flex justify-center w-full", avatarOverlapClass(hasTopImage, "lg"))}>
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover rounded-full border-[4px] bg-white shadow-xl"
            style={{
              width: 120,
              height: 120,
              borderColor: buttonColor,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      {title && (
        <h1
          style={{
            fontSize: `${titleFontSize * 1.25}px`,
            textAlign: "center",
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: Math.max(titleFontWeight, 700),
            lineHeight: 1.1,
            width: "100%",
            letterSpacing: "-0.03em",
            marginTop: 4,
          }}
        >
          {title}
        </h1>
      )}
      {description && (
        <p
          style={{
            fontSize: `${descriptionFontSize * 1.05}px`,
            textAlign: "center",
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            opacity: 0.72,
            lineHeight: 1.55,
            fontWeight: descriptionFontWeight,
            width: "100%",
            maxWidth: 340,
            marginTop: -4,
          }}
        >
          {description}
        </p>
      )}
      <div className="w-full pt-1">
        <PageLinks
          pageLinks={pageLinks}
          textAlignment="center"
          ExternalLink={ExternalLink}
          buttonColor={buttonColor}
          buttonTextColor={linkProps.buttonTextColor}
          onLinkClick={props.onLinkClick}
          {...linkProps}
        />
      </div>
      <SocialIcons
        socialLinks={socialLinks}
        socialIcons={socialIcons}
        textColor={textColor}
        buttonColor={buttonColor}
        buttonTextColor={linkProps.buttonTextColor}
        Globe={Globe}
        {...linkProps}
      />
    </LayoutShell>
  );
}
