import { cn } from "@/lib/utils/cn";
import { Banner } from "./banner";
import type { PageLayoutProps } from "./types";

type ShellBannerProps = Pick<
  PageLayoutProps,
  | "showBanner"
  | "bannerText"
  | "bannerImageUrl"
  | "bannerUrl"
  | "bannerStyle"
  | "bannerPosition"
  | "bannerType"
  | "maxContentWidth"
  | "spacing"
>;

interface LayoutShellProps extends ShellBannerProps {
  children: React.ReactNode;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
}

/**
 * Full-bleed image banners sit outside the content max-width.
 * Content never overlaps the banner — layouts may pull only the
 * avatar up with a negative margin so titles stay readable.
 */
export function LayoutShell({
  showBanner,
  bannerText,
  bannerImageUrl,
  bannerUrl,
  bannerStyle,
  bannerPosition,
  bannerType,
  maxContentWidth,
  spacing,
  children,
  contentClassName,
  contentStyle,
}: LayoutShellProps) {
  const hasTopImage =
    showBanner && bannerPosition === "top" && bannerType === "image" && !!bannerImageUrl;
  const hasTopText =
    showBanner && bannerPosition === "top" && bannerType === "text" && !!bannerText;
  const hasBottomImage =
    showBanner && bannerPosition === "bottom" && bannerType === "image" && !!bannerImageUrl;
  const hasBottomText =
    showBanner && bannerPosition === "bottom" && bannerType === "text" && !!bannerText;

  const bannerProps = {
    bannerText,
    bannerImageUrl,
    bannerUrl,
    bannerStyle,
    bannerType,
  };

  return (
    <div className="relative z-10 w-full flex flex-col items-center self-stretch">
      {hasTopImage && <Banner {...bannerProps} variant="hero" />}

      <div
        className={cn(
          "relative z-10 w-full flex flex-col px-5 sm:px-6",
          contentClassName
        )}
        style={{
          maxWidth: `${maxContentWidth}px`,
          gap: `${spacing}px`,
          // Keep body text on the page background — never over the banner
          paddingTop: hasTopImage ? 0 : 32,
          paddingBottom: hasBottomImage ? 28 : 48,
          ...contentStyle,
        }}
      >
        {hasTopText && <Banner {...bannerProps} variant="inline" />}
        {children}
        {hasBottomText && <Banner {...bannerProps} variant="inline" />}
      </div>

      {hasBottomImage && <Banner {...bannerProps} variant="hero" />}
    </div>
  );
}

/** Negative margin so only the avatar sits on the banner edge */
export function avatarOverlapClass(hasTopImageBanner: boolean, size: "sm" | "md" | "lg" = "md") {
  if (!hasTopImageBanner) return "";
  if (size === "sm") return "-mt-8 relative z-20";
  if (size === "lg") return "-mt-14 relative z-20";
  return "-mt-11 relative z-20";
}
