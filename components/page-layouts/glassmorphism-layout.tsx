import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface GlassmorphismLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Frosted glass card — banner stays behind, all text inside the card */
export function GlassmorphismLayout(props: GlassmorphismLayoutProps) {
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
      spacing={0}
      contentStyle={{
        marginTop: hasTopImage ? -56 : 24,
        paddingTop: 0,
      }}
    >
      <div
        className="w-full rounded-3xl px-7 py-9 flex flex-col items-center"
        style={{
          gap: `${spacing}px`,
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
        }}
      >
        {showProfileImage && profileImageUrl && (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover rounded-full border-[3px] bg-white"
            style={{
              width: 92,
              height: 92,
              borderColor: buttonColor,
              boxShadow: `0 4px 16px ${buttonColor}35`,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize * 1.05}px`,
              textAlign: "center",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: titleFontWeight,
              lineHeight: 1.2,
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
              textAlign: "center",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              opacity: 0.8,
              lineHeight: 1.55,
              fontWeight: descriptionFontWeight,
              width: "100%",
              marginTop: -Math.max(4, spacing * 0.3),
            }}
          >
            {description}
          </p>
        )}
        <PageLinks
          pageLinks={pageLinks}
          textAlignment="center"
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
    </LayoutShell>
  );
}
