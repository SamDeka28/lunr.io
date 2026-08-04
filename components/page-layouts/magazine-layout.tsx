import { PageLayoutProps } from "./types";
import { LayoutShell } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

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
      contentClassName="items-stretch"
      contentStyle={{ paddingTop: hasTopImage ? 20 : 32 }}
    >
      {/* Masthead — always on page background */}
      {title && (
        <h1
          style={{
            fontSize: `${titleFontSize * 1.45}px`,
            textAlign: "left",
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: Math.max(titleFontWeight, 700),
            lineHeight: 1.05,
            width: "100%",
            letterSpacing: "-0.04em",
            borderBottom: `3px solid ${textColor}`,
            paddingBottom: 12,
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
            style={{ width: 48, height: 48, borderColor: buttonColor }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {description && (
          <p
            style={{
              fontSize: `${descriptionFontSize * 0.95}px`,
              textAlign: "left",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              opacity: 0.7,
              lineHeight: 1.45,
              fontWeight: descriptionFontWeight,
              fontStyle: "italic",
              flex: 1,
              minWidth: 0,
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
            paddingTop: 16,
            paddingBottom: 16,
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
              className="block w-full text-left transition-opacity hover:opacity-80"
              style={{
                backgroundColor: buttonColor,
                color: linkProps.buttonTextColor,
                padding: `${linkProps.buttonPadding + 4}px ${linkProps.buttonPadding + 8}px`,
                borderRadius: `${linkProps.buttonBorderRadius}px`,
                fontFamily: `"${fontFamily}", sans-serif`,
                fontSize: `${descriptionFontSize * 1.05}px`,
                fontWeight: linkProps.buttonFontWeight,
              }}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{featured.title}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-80" />
              </span>
            </a>
          ) : (
            <div
              className="w-full text-left"
              style={{
                backgroundColor: buttonColor,
                color: linkProps.buttonTextColor,
                padding: `${linkProps.buttonPadding + 4}px ${linkProps.buttonPadding + 8}px`,
                borderRadius: `${linkProps.buttonBorderRadius}px`,
                fontFamily: `"${fontFamily}", sans-serif`,
                fontSize: `${descriptionFontSize * 1.05}px`,
                fontWeight: linkProps.buttonFontWeight,
              }}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{featured.title}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-80" />
              </span>
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="w-full flex flex-col" style={{ gap: `${linkProps.linkGap}px` }}>
          <PageLinks
            pageLinks={rest}
            textAlignment="left"
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            buttonTextColor={linkProps.buttonTextColor}
            onLinkClick={props.onLinkClick}
            {...linkProps}
          />
        </div>
      )}

      {Object.keys(socialLinks).some((key) => socialLinks[key]) && (
        <div className="w-full border-t pt-5" style={{ borderColor: `${textColor}18` }}>
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
      )}
    </LayoutShell>
  );
}
