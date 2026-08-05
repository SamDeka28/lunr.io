import type { SocialLinksMap } from "@/lib/utils/social-links";

export interface PageLayoutProps {
  // Content
  title?: string;
  description?: string;
  pageLinks: Array<{ id: string; title: string; url: string }>;
  socialLinks: SocialLinksMap | Record<string, any>;
  
  // Design
  fontFamily: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  titleFontSize: number;
  descriptionFontSize: number;
  titleFontWeight: number;
  descriptionFontWeight: number;
  buttonFontWeight: number;
  buttonFontSize: number;
  buttonVariant: "filled" | "outlined" | "soft" | "glass";
  buttonShadow: "none" | "soft" | "strong";
  buttonTheme: "solid" | "soft" | "outline" | "pill" | "glass" | "flat";
  buttonBorderRadius: number;
  buttonPadding: number;
  buttonTextAlignment: "left" | "center" | "right";
  spacing: number;
  linkGap: number;
  maxContentWidth: number;
  textAlignment: "left" | "center" | "right";
  verticalAlign: "top" | "center";
  
  // Profile
  showProfileImage: boolean;
  profileImageUrl: string;
  
  // Banner
  showBanner: boolean;
  bannerText: string;
  bannerImageUrl: string;
  bannerUrl: string;
  bannerStyle: "info" | "success" | "warning" | "error";
  bannerPosition: "top" | "bottom";
  bannerType: "text" | "image";
  
  // Social Icons
  socialIconSize: number;
  socialIconStyle: "filled" | "outlined" | "minimal";
  socialIconShape: "circle" | "square" | "rounded";
  socialIconPadding: number;
  socialIconGap: number;
  
  // Icons
  socialIcons: Record<string, React.ComponentType<any>>;
  ExternalLink: React.ComponentType<any>;
  
  // Optional click handler for public pages
  onLinkClick?: (linkId: string, url: string) => void;
}

export type LayoutTemplate = 
  | "centered" 
  | "left" 
  | "card" 
  | "split" 
  | "minimal" 
  | "hero" 
  | "sidebar" 
  | "grid" 
  | "magazine";

