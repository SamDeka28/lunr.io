import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface CenteredLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function CenteredLayout(props: CenteredLayoutProps) {
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
    textAlignment,
    socialIcons,
    Globe,
    ExternalLink,
    ...linkProps
  } = props;

  return (
    <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: `${maxContentWidth}px`, gap: `${spacing}px`, width: "100%" }}>
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
      <div className="w-full" style={{ width: "100%" }}>
        {showProfileImage && profileImageUrl && (
          <div className="flex justify-center">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="object-cover border-2 rounded-full"
              style={{
                width: "80px",
                height: "80px",
                borderColor: buttonColor,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className={cn("flex flex-col", "items-center")} style={{ gap: spacing }}>
          {title && (
            <h1
              style={{
                fontSize: `${titleFontSize}px`,
                textAlign: textAlignment as any,
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
                textAlign: textAlignment as any,
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
            textAlignment={textAlignment}
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            buttonTextColor={linkProps.buttonTextColor}
            onLinkClick={props.onLinkClick}
            {...linkProps}
          />
        </div>
      </div>
      <SocialIcons
        socialLinks={socialLinks}
        socialIcons={socialIcons}
        textColor={textColor}
        buttonColor={buttonColor}
        buttonTextColor={linkProps.buttonTextColor}
        Globe={Globe}
        {...linkProps}
      />
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

