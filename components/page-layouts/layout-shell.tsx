import { cn } from "@/lib/utils/cn";
import { fluidSpace } from "@/lib/utils/fluid-type";
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
  | "verticalAlign"
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
  verticalAlign = "top",
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

  const isVerticallyCentered = verticalAlign === "center";
  const padTop = hasTopImage ? 0 : undefined;

  return (
    <div
      className={cn(
        "relative z-10 w-full flex flex-col items-center self-stretch",
        isVerticallyCentered && "flex-1 min-h-0"
      )}
    >
      {hasTopImage && <Banner {...bannerProps} variant="hero" />}

      <div
        className={cn(
          "relative z-10 w-full flex flex-col px-4 sm:px-6",
          !hasTopImage && !isVerticallyCentered && "pt-6 sm:pt-8",
          !hasBottomImage && !isVerticallyCentered && "pb-8 sm:pb-12",
          hasBottomImage && "pb-5 sm:pb-7",
          isVerticallyCentered && "flex-1 justify-center py-6 sm:py-8",
          contentClassName
        )}
        style={{
          maxWidth: `min(100%, ${maxContentWidth}px)`,
          gap: fluidSpace(spacing),
          ...(padTop !== undefined ? { paddingTop: padTop } : {}),
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
  if (size === "sm") return "-mt-6 sm:-mt-8 relative z-20";
  if (size === "lg") return "-mt-10 sm:-mt-14 relative z-20";
  return "-mt-8 sm:-mt-11 relative z-20";
}
