import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";
import { fluidAvatar, fluidBody, fluidTitle } from "@/lib/utils/fluid-type";

interface PortfolioLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Professional header band + labeled sections */
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

  const hasTopImage =
    showBanner && bannerPosition === "top" && bannerType === "image" && !!bannerImageUrl;

  const avatar = fluidAvatar(88, 64);

  return (
    <LayoutShell
      showBanner={showBanner}
      bannerText={bannerText}
      bannerImageUrl={bannerImageUrl}
      bannerUrl={bannerUrl}
      bannerStyle={bannerStyle}
      bannerPosition={bannerPosition}
      bannerType={bannerType}
      maxContentWidth={Math.max(maxContentWidth, 500)}
      spacing={spacing}
      verticalAlign={props.verticalAlign}
>
      <div
        className="flex flex-row gap-4 sm:gap-5 items-start w-full pb-4 sm:pb-5"
        style={{ borderBottom: `2px solid ${textColor}14` }}
      >
        {showProfileImage && profileImageUrl && (
          <div className={cn("flex-shrink-0", avatarOverlapClass(hasTopImage, "sm"))}>
            <img
              src={profileImageUrl}
              alt="Profile"
              className="object-cover rounded-xl border-2 bg-white shadow-md"
              style={{ width: avatar, height: avatar, borderColor: buttonColor }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div
          className="flex-1 flex flex-col items-start min-w-0"
          style={{
            gap: 8,
            paddingTop: hasTopImage ? 8 : 0,
          }}
        >
          {title && (
            <h1
              className="break-words w-full"
              style={{
                fontSize: fluidTitle(titleFontSize, 1.05),
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                fontWeight: titleFontWeight,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
          )}
          {description && (
            <p
              className="break-words w-full"
              style={{
                fontSize: fluidBody(descriptionFontSize),
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                opacity: 0.7,
                lineHeight: 1.55,
                fontWeight: descriptionFontWeight,
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {pageLinks.length > 0 && (
        <div className="w-full">
          <p
            style={{
              fontSize: 11,
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: 700,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.45,
            }}
          >
            Links
          </p>
          <PageLinks
            {...linkProps}
            pageLinks={pageLinks}
            ExternalLink={ExternalLink}
            buttonColor={buttonColor}
            fontFamily={fontFamily}
            onLinkClick={props.onLinkClick}
          />
        </div>
      )}

      {Object.keys(socialLinks).some((key) => socialLinks[key]) && (
        <div className="w-full pt-1" style={{ borderTop: `1px solid ${textColor}12` }}>
          <p
            style={{
              fontSize: 11,
              fontFamily: `"${fontFamily}", sans-serif`,
              color: textColor,
              fontWeight: 700,
              marginBottom: 12,
              marginTop: 16,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.45,
            }}
          >
            Connect
          </p>
          <SocialIcons
            {...linkProps}
            socialLinks={socialLinks}
            socialIcons={socialIcons}
            textColor={textColor}
            buttonColor={buttonColor}
            Globe={Globe}
          />
        </div>
      )}
    </LayoutShell>
  );
}
