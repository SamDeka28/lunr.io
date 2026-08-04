import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { fluidAvatar, fluidBody, fluidTitle } from "@/lib/utils/fluid-type";

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

  const avatar = fluidAvatar(92, 68);

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
      verticalAlign={props.verticalAlign}
      contentStyle={{
        marginTop: hasTopImage ? -56 : 24,
        paddingTop: 0,
      }}
    >
      <div
        className="w-full rounded-3xl px-5 py-7 sm:px-7 sm:py-9 flex flex-col items-center"
        style={{
          gap: `clamp(${Math.max(12, Math.round(spacing * 0.75))}px, 2.5vw, ${spacing || 24}px)`,
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
              width: avatar,
              height: avatar,
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
            className="break-words"
            style={{
              fontSize: fluidTitle(titleFontSize, 1.05),
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
            className="break-words"
            style={{
              fontSize: fluidBody(descriptionFontSize),
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
    </LayoutShell>
  );
}
