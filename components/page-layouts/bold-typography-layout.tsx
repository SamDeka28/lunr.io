import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { fluidAvatar, fluidBody, fluidTitle } from "@/lib/utils/fluid-type";

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

  const avatar = fluidAvatar(56, 44);

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
      verticalAlign={props.verticalAlign}
      contentClassName="items-center text-center"
      contentStyle={{ paddingTop: hasTopImage ? 16 : undefined }}
    >
      {showProfileImage && profileImageUrl && (
        <img
          src={profileImageUrl}
          alt="Profile"
          className="object-cover rounded-full border-2 bg-white shadow-sm"
          style={{ width: avatar, height: avatar, borderColor: buttonColor }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {title && (
        <h1
          className="break-words"
          style={{
            fontSize: fluidTitle(Math.min(titleFontSize * 1.55, 72)),
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
          className="break-words"
          style={{
            fontSize: fluidBody(descriptionFontSize),
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
          style={{
            gap: `clamp(${Math.max(8, Math.round(linkProps.linkGap * 0.65))}px, 2vw, ${Math.round(linkProps.linkGap * 0.85)}px)`,
          }}
        >
          <PageLinks
            {...linkProps}
            pageLinks={pageLinks}
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            fontFamily={fontFamily}
            onLinkClick={props.onLinkClick}
          />
        </div>
      )}
      <SocialIcons
        {...linkProps}
        socialLinks={socialLinks}
        socialIcons={socialIcons}
        textColor={textColor}
        buttonColor={buttonColor}
        Globe={Globe}
      />
    </LayoutShell>
  );
}
