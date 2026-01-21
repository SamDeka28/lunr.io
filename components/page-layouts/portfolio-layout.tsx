import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface PortfolioLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function PortfolioLayout(props: PortfolioLayoutProps) {
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

  return (
    <div className="relative z-10 w-full flex flex-col" style={{ gap: `${spacing * 1.5}px`, maxWidth: `${maxContentWidth}px`, width: "100%" }}>
      {showBanner && bannerPosition === "top" && (
        <Banner
          bannerText={bannerText}
          bannerImageUrl={bannerImageUrl}
          bannerUrl={bannerUrl}
          bannerStyle={bannerStyle}
          bannerType={bannerType}
          maxContentWidth={maxContentWidth}
        />
      )}
      <div className="flex flex-row gap-8 items-start pb-8" style={{ borderBottom: `2px solid ${textColor}20` }}>
        {showProfileImage && profileImageUrl && (
          <div className="flex-shrink-0">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="object-cover border-2 rounded-lg"
              style={{
                width: "120px",
                height: "120px",
                borderColor: buttonColor,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col items-start" style={{ gap: `${spacing * 0.6}px` }}>
          {title && (
            <h1
              style={{
                fontSize: `${titleFontSize * 1.2}px`,
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                fontWeight: titleFontWeight,
                lineHeight: 1.1,
                width: "100%",
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
                opacity: 0.7,
                lineHeight: 1.6,
                fontWeight: descriptionFontWeight,
                width: "100%",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {pageLinks.length > 0 && (
        <div className="w-full">
          <h2 style={{ 
            fontSize: `${titleFontSize * 0.7}px`, 
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: titleFontWeight,
            marginBottom: `${spacing * 0.5}px`,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            opacity: 0.6
          }}>Links</h2>
          <PageLinks
            pageLinks={pageLinks}
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
        <div className="w-full pt-4" style={{ borderTop: `1px solid ${textColor}20` }}>
          <h2 style={{ 
            fontSize: `${titleFontSize * 0.7}px`, 
            fontFamily: `"${fontFamily}", sans-serif`,
            color: textColor,
            fontWeight: titleFontWeight,
            marginBottom: `${spacing * 0.5}px`,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            opacity: 0.6
          }}>Connect</h2>
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
      {showBanner && bannerPosition === "bottom" && (
        <Banner
          bannerText={bannerText}
          bannerImageUrl={bannerImageUrl}
          bannerUrl={bannerUrl}
          bannerStyle={bannerStyle}
          bannerType={bannerType}
          maxContentWidth={maxContentWidth}
        />
      )}
    </div>
  );
}

