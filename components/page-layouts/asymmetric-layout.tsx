import { PageLayoutProps } from "./types";
import { LayoutShell, avatarOverlapClass } from "./layout-shell";
import { PageLinks } from "./page-links";
import { SocialIcons } from "./social-icons";
import { cn } from "@/lib/utils/cn";
import { fluidAvatar, fluidBody, fluidSpace, fluidTitle } from "@/lib/utils/fluid-type";

interface AsymmetricLayoutProps extends PageLayoutProps {
  Globe: React.ComponentType<any>;
}

/** Offset portrait + left-aligned copy — clearly not a centered stack */
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

  const hasTopImage =
    showBanner && bannerPosition === "top" && bannerType === "image" && !!bannerImageUrl;

  const avatar = fluidAvatar(128, 72);

  return (
    <LayoutShell
      showBanner={showBanner}
      bannerText={bannerText}
      bannerImageUrl={bannerImageUrl}
      bannerUrl={bannerUrl}
      bannerStyle={bannerStyle}
      bannerPosition={bannerPosition}
      bannerType={bannerType}
      maxContentWidth={Math.max(maxContentWidth, 520)}
      spacing={spacing}
      verticalAlign={props.verticalAlign}
>
      <div className="w-full flex flex-row gap-4 sm:gap-5 items-start">
        {showProfileImage && profileImageUrl && (
          <div className={cn("flex-shrink-0", avatarOverlapClass(hasTopImage, "md"))}>
            <img
              src={profileImageUrl}
              alt="Profile"
              className="object-cover rounded-2xl border-[3px] bg-white shadow-lg"
              style={{
                width: avatar,
                height: avatar,
                borderColor: buttonColor,
                transform: "rotate(-2deg)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div
          className="flex-1 flex flex-col items-start min-w-0"
          style={{
            gap: fluidSpace(Math.max(10, spacing * 0.6)),
            paddingTop: hasTopImage ? 8 : 4,
          }}
        >
          {title && (
            <h1
              className="break-words w-full"
              style={{
                fontSize: fluidTitle(titleFontSize, 1.08),
                textAlign: "left",
                fontFamily: `"${fontFamily}", sans-serif`,
                color: textColor,
                fontWeight: titleFontWeight,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
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
                opacity: 0.72,
                lineHeight: 1.55,
                fontWeight: descriptionFontWeight,
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="w-full" style={{ marginTop: 4 }}>
        <PageLinks
          {...linkProps}
          pageLinks={pageLinks}
          ExternalLink={ExternalLink}
          buttonColor={buttonColor}
          fontFamily={fontFamily}
          onLinkClick={props.onLinkClick}
        />
      </div>
      <div className="w-full flex justify-start">
        <SocialIcons
          {...linkProps}
          socialLinks={socialLinks}
          socialIcons={socialIcons}
          textColor={textColor}
          buttonColor={buttonColor}
          Globe={Globe}
        />
      </div>
    </LayoutShell>
  );
}
