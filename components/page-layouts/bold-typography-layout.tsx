import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface BoldTypographyLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

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

  return (
    <div className="relative z-10 w-full flex flex-col items-center" style={{ gap: `${spacing * 1.2}px`, maxWidth: `${maxContentWidth * 0.85}px`, width: "100%" }}>
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
          className="object-cover border-3 rounded-full mx-auto"
          style={{
            width: "90px",
            height: "90px",
            borderColor: buttonColor,
            borderWidth: "3px",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col items-center text-center w-full" style={{ gap: `${spacing * 0.8}px` }}>
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize * 1.4}px`,
              textAlign: "center",
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: titleFontWeight >= 600 ? titleFontWeight : 700,
              lineHeight: 1.1,
              width: "100%",
              letterSpacing: "-0.03em",
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
              opacity: 0.65,
              lineHeight: 1.5,
              fontWeight: descriptionFontWeight,
              width: "100%",
              letterSpacing: "0.01em",
            }}
          >
            {description}
          </p>
        )}
        {pageLinks.length > 0 && (
          <div className="w-full" style={{ gap: `${linkProps.linkGap * 0.8}px`, display: "flex", flexDirection: "column", marginTop: `${spacing * 0.5}px` }}>
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

