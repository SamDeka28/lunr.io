import { PageLayoutProps } from "./types";
import { Banner } from "./banner";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";

interface GridLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

export function GridLayout(props: GridLayoutProps) {
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
    descriptionFontSize: descSize,
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
      {showProfileImage && profileImageUrl && (
        <img
          src={profileImageUrl}
          alt="Profile"
          className="object-cover border-2 rounded-full mx-auto"
          style={{
            width: "80px",
            height: "80px",
            borderColor: buttonColor,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col items-center text-center w-full" style={{ gap: `${spacing}px` }}>
        {title && (
          <h1
            style={{
              fontSize: `${titleFontSize}px`,
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
              fontSize: `${descriptionFontSize}px`,
              textAlign: "center",
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
        {pageLinks.length > 0 && (
          <div className="w-full grid grid-cols-2 gap-3">
            {pageLinks.map((link) => {
              const linkContent = (
                <div className="flex items-center gap-2 justify-center">
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </div>
              );

              const linkStyle = {
                backgroundColor: buttonColor,
                color: linkProps.buttonTextColor,
                padding: `${linkProps.buttonPadding}px`,
                borderRadius: `${linkProps.buttonBorderRadius}px`,
                fontFamily: `"${fontFamily}", sans-serif`,
                fontSize: `${descriptionFontSize * 0.9}px`,
                fontWeight: linkProps.buttonFontWeight,
              };

              if (props.onLinkClick) {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      props.onLinkClick!(link.id, link.url);
                      window.open(link.url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full transition-all hover:opacity-90 active:scale-[0.98] shadow-soft text-center block"
                    style={linkStyle}
                  >
                    {linkContent}
                  </a>
                );
              }

              return (
                <div
                  key={link.id}
                  className="w-full transition-all hover:opacity-90 active:scale-[0.98] shadow-soft text-center"
                  style={linkStyle}
                >
                  {linkContent}
                </div>
              );
            })}
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

