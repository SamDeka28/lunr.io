import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface BoldTypographyLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Typography-first — huge name, tiny avatar, minimal chrome */
export function BoldTypographyLayout(props: BoldTypographyLayoutProps) {
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
      maxContentWidth={Math.round(maxContentWidth * 0.9)}
      spacing={Math.max(12, spacing * 0.75)}
      contentClassName="items-center text-center"
      contentStyle={{ paddingTop: hasTopImage ? 24 : 40 }}
    >
      {showProfileImage && profileImageUrl && (
        <img
          src={profileImageUrl}
          alt="Profile"
          className="object-cover rounded-full border-2 bg-white shadow-sm"
          style={{ width: 56, height: 56, borderColor: buttonColor }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {title && (
        <h1
          style={{
            fontSize: `${Math.min(titleFontSize * 1.55, 72)}px`,
            textAlign: "center",
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: Math.max(titleFontWeight, 800),
            lineHeight: 0.95,
            width: "100%",
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
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
            opacity: 0.6,
            lineHeight: 1.5,
            fontWeight: descriptionFontWeight,
            width: "100%",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginTop: 0,
          }}
        >
          {description}
        </p>
      )}
      {pageLinks.length > 0 && (
        <div
          className="w-full flex flex-col pt-2"
          style={{ gap: `${linkProps.linkGap * 0.85}px` }}
        >
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
      )}
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
