import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { getLinkButtonStyle } from "@/lib/utils/link-button-style";
import { fluidAvatar, fluidBody, fluidTitle } from "@/lib/utils/fluid-type";

interface MagazineLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Editorial: oversized headline first, then byline row, then ruled sections */
export function MagazineLayout(props: MagazineLayoutProps) {
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

  const [featured, ...rest] = pageLinks;
  const avatar = fluidAvatar(48, 40);

  const featuredStyle = getLinkButtonStyle({
    buttonColor,
    buttonTextColor: linkProps.buttonTextColor,
    buttonVariant: linkProps.buttonVariant,
    buttonShadow: linkProps.buttonShadow,
    buttonFontSize: Math.round((linkProps.buttonFontSize || descriptionFontSize) * 1.05),
    buttonFontWeight: linkProps.buttonFontWeight,
    buttonBorderRadius: linkProps.buttonBorderRadius,
    buttonPadding: linkProps.buttonPadding + 4,
    fontFamily,
    paddingScale: 1.15,
  });

  return (
    <LayoutShell
      showBanner={showBanner}
      bannerText={bannerText}
      bannerImageUrl={bannerImageUrl}
      bannerUrl={bannerUrl}
      bannerStyle={bannerStyle}
      bannerPosition={bannerPosition}
      bannerType={bannerType}
      maxContentWidth={Math.max(maxContentWidth, 460)}
      spacing={spacing}
      verticalAlign={props.verticalAlign}
      contentClassName="items-stretch"
      contentStyle={{ paddingTop: hasTopImage ? 16 : undefined }}
    >
      {title && (
        <h1
          className="break-words"
          style={{
            fontSize: fluidTitle(titleFontSize, 1.45),
            textAlign: "left",
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: Math.max(titleFontWeight, 700),
            lineHeight: 1.05,
            width: "100%",
            letterSpacing: "-0.04em",
            borderBottom: `3px solid ${textColor}`,
            paddingBottom: 10,
          }}
        >
          {title}
        </h1>
      )}

      <div className="w-full flex flex-row gap-3 items-center">
        {showProfileImage && profileImageUrl && (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover rounded-full border-2 bg-white flex-shrink-0"
            style={{ width: avatar, height: avatar, borderColor: buttonColor }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {description && (
          <p
            className="break-words min-w-0"
            style={{
              fontSize: fluidBody(descriptionFontSize, 0.95),
              textAlign: "left",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              opacity: 0.7,
              lineHeight: 1.45,
              fontWeight: descriptionFontWeight,
              fontStyle: "italic",
              flex: 1,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {featured && (
        <div
          className="w-full"
          style={{
            borderTop: `1px solid ${textColor}22`,
            borderBottom: `1px solid ${textColor}22`,
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: textColor,
              opacity: 0.4,
              marginBottom: 10,
              fontFamily: `"${fontFamily}", sans-serif`,
            }}
          >
            Featured
          </p>
          {props.onLinkClick ? (
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                props.onLinkClick!(featured.id, featured.url);
                window.open(featured.url, "_blank", "noopener,noreferrer");
              }}
              className="block w-full text-left transition-opacity hover:opacity-80 break-words"
              style={featuredStyle}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 break-words">{featured.title}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-80" />
              </span>
            </a>
          ) : (
            <div className="w-full text-left break-words" style={featuredStyle}>
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 break-words">{featured.title}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-80" />
              </span>
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div
          className="w-full flex flex-col"
          style={{
            gap: `clamp(${Math.max(8, Math.round(linkProps.linkGap * 0.75))}px, 2vw, ${linkProps.linkGap}px)`,
          }}
        >
          <PageLinks
            {...linkProps}
            pageLinks={rest}
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            fontFamily={fontFamily}
            onLinkClick={props.onLinkClick}
          />
        </div>
      )}

      {Object.keys(socialLinks).some((key) => socialLinks[key]) && (
        <div className="w-full border-t pt-4 sm:pt-5" style={{ borderColor: `${textColor}18` }}>
          <SocialIcons
            {...linkProps}
            socialLinks={socialLinks}
            socialIcons={socialIcons}
            textColor={textColor}
            buttonColor={buttonColor}
            Globe={Globe}
          />
        </div>
      )}
    </LayoutShell>
  );
}
