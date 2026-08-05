import { PageLayoutProps } from "./types";
import {
  getKnownSocialUrl,
  getOtherSocialLinks,
  hasAnySocialLinks,
} from "@/lib/utils/social-links";

interface SocialIconsProps {
  socialLinks: PageLayoutProps["socialLinks"];
  socialIcons: PageLayoutProps["socialIcons"];
  socialIconSize: number;
  socialIconStyle: PageLayoutProps["socialIconStyle"];
  socialIconShape: PageLayoutProps["socialIconShape"];
  socialIconPadding: number;
  socialIconGap: number;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  Globe: React.ComponentType<any>;
}

const KNOWN_ORDER = [
  "email",
  "twitter",
  "instagram",
  "linkedin",
  "github",
  "youtube",
  "facebook",
  "website",
];

export function SocialIcons({
  socialLinks,
  socialIcons,
  socialIconSize,
  socialIconStyle,
  socialIconShape,
  socialIconPadding,
  socialIconGap,
  textColor,
  buttonColor,
  buttonTextColor,
  Globe,
}: SocialIconsProps) {
  if (!hasAnySocialLinks(socialLinks)) {
    return null;
  }

  const getIconStyle = (): React.CSSProperties => {
    const totalSize = socialIconSize + socialIconPadding * 2;

    const baseStyle: React.CSSProperties = {
      width: `${totalSize}px`,
      height: `${totalSize}px`,
      color: textColor,
      opacity: 0.8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
      padding: `${socialIconPadding}px`,
      overflow: "hidden",
    };

    if (socialIconStyle === "filled") {
      baseStyle.backgroundColor = buttonColor;
      baseStyle.color = buttonTextColor;
      baseStyle.opacity = 1;
    } else if (socialIconStyle === "outlined") {
      baseStyle.border = `2px solid ${textColor}`;
      baseStyle.opacity = 0.8;
    }

    if (socialIconShape === "circle") {
      baseStyle.borderRadius = "50%";
    } else if (socialIconShape === "square") {
      baseStyle.borderRadius = "0";
    } else if (socialIconShape === "rounded") {
      baseStyle.borderRadius = "8px";
    }

    return baseStyle;
  };

  const others = getOtherSocialLinks(socialLinks);
  const iconStyle = getIconStyle();

  return (
    <div
      className="flex flex-wrap items-center justify-center max-w-full"
      style={{
        gap: `clamp(${Math.max(8, Math.round(socialIconGap * 0.75))}px, 2vw, ${socialIconGap}px)`,
      }}
    >
      {KNOWN_ORDER.map((platform) => {
        const url = getKnownSocialUrl(socialLinks, platform);
        if (!url) return null;
        const Icon = socialIcons[platform.toLowerCase()] || Globe;

        return (
          <a
            key={platform}
            href={platform === "email" ? `mailto:${url}` : url}
            target={platform === "email" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="transition-all hover:opacity-100 hover:scale-110"
            style={iconStyle}
            title={platform}
          >
            <Icon style={{ width: `${socialIconSize}px`, height: `${socialIconSize}px` }} />
          </a>
        );
      })}

      {others.map((item) => {
        if (!item.url.trim()) return null;
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all hover:opacity-100 hover:scale-110"
            style={{
              ...iconStyle,
              padding: item.iconUrl ? 0 : iconStyle.padding,
            }}
            title={item.label || "Link"}
          >
            {item.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.iconUrl}
                alt={item.label || ""}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Globe
                style={{ width: `${socialIconSize}px`, height: `${socialIconSize}px` }}
              />
            )}
          </a>
        );
      })}
    </div>
  );
}
