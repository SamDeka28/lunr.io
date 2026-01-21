import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface SplitLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function SplitLayout(props: SplitLayoutProps) {
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
    <div className="relative z-10 w-full flex flex-col items-center" style={{ gap: `${spacing}px`, maxWidth: `${maxContentWidth}px`, width: "100%" }}>
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
      <div className={cn("w-full", "grid grid-cols-1 md:grid-cols-2 gap-8 items-center")} style={{ 
        maxWidth: "100%",
        width: "100%"
      }}>
        {showProfileImage && profileImageUrl && (
          <img
            src={profileImageUrl}
            alt="Profile"
            className={cn("object-cover border-2", "rounded-lg w-full h-64")}
            style={{
              width: "100%",
              height: "100%",
              borderColor: buttonColor,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className={cn("flex flex-col", "items-start")} style={{ gap: `${spacing}px` }}>
          {title && (
            <h1
              style={{
                fontSize: `${titleFontSize}px`,
                textAlign: "left",
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
                fontSize: `${descriptionFontSize}px`,
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                opacity: 0.8,
                lineHeight: 1.5,
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

