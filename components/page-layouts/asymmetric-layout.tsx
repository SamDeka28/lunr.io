import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface AsymmetricLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function AsymmetricLayout(props: AsymmetricLayoutProps) {
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
    <div className="relative z-10 w-full flex flex-row gap-6 items-start" style={{ maxWidth: `${maxContentWidth}px`, width: "100%" }}>
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
      {showProfileImage && profileImageUrl && (
        <div className="flex-shrink-0" style={{ marginTop: `${spacing * 0.3}px` }}>
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover border-3 rounded-2xl"
            style={{
              width: "140px",
              height: "140px",
              borderColor: buttonColor,
              borderWidth: "4px",
              boxShadow: `0 8px 24px ${buttonColor}40`,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col items-start" style={{ gap: `${spacing * 0.8}px` }}>
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize * 1.1}px`,
              textAlign: "left",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: titleFontWeight,
              lineHeight: 1.1,
              width: "100%",
              letterSpacing: "-0.01em",
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
              opacity: 0.75,
              lineHeight: 1.6,
              fontWeight: descriptionFontWeight,
              width: "100%",
            }}
          >
            {description}
          </p>
        )}
        <PageLinks
          pageLinks={pageLinks}
          textAlignment="left"
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

