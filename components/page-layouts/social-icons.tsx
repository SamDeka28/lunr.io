import { PageLayoutProps } from "./types";

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
  if (!Object.keys(socialLinks).some((key) => socialLinks[key])) {
    return null;
  }

  const getIconStyle = (): React.CSSProperties => {
    const totalSize = socialIconSize + (socialIconPadding * 2);
    
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

  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: `${socialIconGap}px` }}
    >
      {Object.entries(socialLinks).map(([platform, url]: [string, any]) => {
        if (!url) return null;
        const Icon = socialIcons[platform.toLowerCase()] || Globe;
        
        return (
          <a
            key={platform}
            href={platform === "email" ? `mailto:${url}` : url}
            target={platform === "email" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="transition-all hover:opacity-100 hover:scale-110"
            style={getIconStyle()}
            title={platform}
          >
            <Icon style={{ width: `${socialIconSize}px`, height: `${socialIconSize}px` }} />
          </a>
        );
      })}
    </div>
  );
}

