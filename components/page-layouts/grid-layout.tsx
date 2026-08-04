import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";

interface GridLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Centered header + 2-column link tiles */
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
    socialIcons,
    Globe,
    ExternalLink,
    ...linkProps
  } = props;

  const hasTopImage =
    showBanner && bannerPosition === "top" && bannerType === "image" && !!bannerImageUrl;

  return (
    <LayoutShell
      showBanner={showBanner}
      bannerText={bannerText}
      bannerImageUrl={bannerImageUrl}
      bannerUrl={bannerUrl}
      bannerStyle={bannerStyle}
      bannerPosition={bannerPosition}
      bannerType={bannerType}
      maxContentWidth={Math.max(maxContentWidth, 420)}
      spacing={spacing}
      contentClassName="items-center text-center"
    >
      {showProfileImage && profileImageUrl && (
        <div className={cn("flex justify-center w-full", avatarOverlapClass(hasTopImage))}>
          <img
            src={profileImageUrl}
            alt="Profile"
            className="object-cover rounded-full border-[3px] bg-white shadow-md"
            style={{ width: 80, height: 80, borderColor: buttonColor }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
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
            letterSpacing: "-0.02em",
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
            opacity: 0.75,
            lineHeight: 1.55,
            fontWeight: descriptionFontWeight,
            width: "100%",
            marginTop: -Math.max(4, spacing * 0.25),
          }}
        >
          {description}
        </p>
      )}
      {pageLinks.length > 0 && (
        <div className="w-full grid grid-cols-2 gap-3 pt-1">
          {pageLinks.map((link) => {
            const linkContent = (
              <div className="flex flex-col items-center justify-center gap-1.5 min-h-[72px]">
                <span className="truncate w-full px-1 font-semibold">{link.title}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </div>
            );

            const linkStyle = {
              backgroundColor: buttonColor,
              color: linkProps.buttonTextColor,
              padding: `${Math.max(12, linkProps.buttonPadding * 0.85)}px`,
              borderRadius: `${linkProps.buttonBorderRadius}px`,
              fontFamily: `"${fontFamily}", sans-serif`,
              fontSize: `${descriptionFontSize * 0.88}px`,
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
    </LayoutShell>
  );
}
