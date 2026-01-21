import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface HeroLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

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

  return (
    <div className="relative z-10 w-full flex flex-col items-center" style={{ gap: `${spacing * 1.5}px`, maxWidth: `${maxContentWidth}px`, width: "100%" }}>
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
        <img
          src={profileImageUrl}
          alt="Profile"
          className="object-cover border-4 rounded-full mx-auto"
          style={{
            width: "120px",
            height: "120px",
            borderColor: buttonColor,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col items-center text-center" style={{ gap: `${spacing}px`, width: "100%" }}>
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize * 1.2}px`,
              textAlign: "center",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: titleFontWeight,
              lineHeight: 1.2,
              width: "100%",
            }}
          >
            {title}
          </h1>
        )}
        {description && (
          <p
            style={{
              fontSize: `${descriptionFontSize * 1.1}px`,
              textAlign: "center",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              opacity: 0.8,
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

