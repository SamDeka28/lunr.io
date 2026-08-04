import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface CenteredLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function CenteredLayout(props: CenteredLayoutProps) {
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
    textAlignment,
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
      spacing={spacing}
      contentClassName="items-center"
    >
      {showProfileImage && profileImageUrl && (
        <div className={cn("flex justify-center w-full", avatarOverlapClass(hasTopImage))}>
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover rounded-full border-[3px] bg-white shadow-md"
            style={{ width: 88, height: 88, borderColor: buttonColor }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      {title && (
        <h1
          style={{
            fontSize: `${titleFontSize}px`,
            textAlign: textAlignment,
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: titleFontWeight,
            lineHeight: 1.2,
            width: "100%",
            letterSpacing: "-0.02em",
            textShadow: "0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          {title}
        </h1>
      )}
      {description && (
        <p
          style={{
            fontSize: `${descriptionFontSize}px`,
            textAlign: textAlignment,
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            opacity: 0.78,
            lineHeight: 1.55,
            fontWeight: descriptionFontWeight,
            width: "100%",
            marginTop: -Math.max(6, spacing * 0.35),
          }}
        >
          {description}
        </p>
      )}
      <PageLinks
        pageLinks={pageLinks}
        textAlignment={textAlignment}
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
    </LayoutShell>
  );
}
