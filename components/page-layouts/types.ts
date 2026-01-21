export interface PageLayoutProps {
  // Content
  title?: string;
  description?: string;
  pageLinks: Array<{ id: string; title: string; url: string }>;
  socialLinks: Record<string, string>;
  
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
  buttonBorderRadius: number;
  buttonPadding: number;
  spacing: number;
  linkGap: number;
  maxContentWidth: number;
  textAlignment: "left" | "center" | "right";
  
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

