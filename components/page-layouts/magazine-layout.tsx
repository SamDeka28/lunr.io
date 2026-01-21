import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface MagazineLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

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

  return (
    <div className="relative z-10 w-full flex flex-col items-start" style={{ gap: `${spacing * 1.5}px`, maxWidth: `${maxContentWidth}px`, width: "100%" }}>
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
          className="object-cover border-2 rounded-lg"
          style={{
            width: "100%",
            height: "200px",
            borderColor: buttonColor,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col items-start w-full" style={{ gap: `${spacing * 1.2}px` }}>
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize * 1.3}px`,
              textAlign: "left",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: titleFontWeight,
              lineHeight: 1.1,
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
              fontSize: `${descriptionFontSize * 1.1}px`,
              textAlign: "left",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              opacity: 0.7,
              lineHeight: 1.7,
              fontWeight: descriptionFontWeight,
              width: "100%",
            }}
          >
            {description}
          </p>
        )}
        {pageLinks.length > 0 && (
          <div className="w-full border-t pt-6" style={{ borderColor: `${textColor}20`, gap: `${linkProps.linkGap}px`, display: "flex", flexDirection: "column" }}>
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
          <div className="w-full border-t pt-6" style={{ borderColor: `${textColor}20` }}>
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

