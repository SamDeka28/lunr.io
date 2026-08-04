import { cn } from "@/lib/utils/cn";
import { PageLayoutProps } from "./types";

interface BannerProps {
  bannerText: string;
  bannerImageUrl: string;
  bannerUrl: string;
  bannerStyle: PageLayoutProps["bannerStyle"];
  bannerType: PageLayoutProps["bannerType"];
  variant?: "hero" | "inline";
}

export function Banner({
  bannerText,
  bannerImageUrl,
  bannerUrl,
  bannerStyle,
  bannerType,
  variant = "inline",
}: BannerProps) {
  if (bannerType === "image" && bannerImageUrl) {
    const isHero = variant === "hero";
    const image = (
      <img
        src={bannerImageUrl}
        alt="Banner"
        className={cn(
          "w-full object-cover",
          isHero
            ? "h-40 sm:h-48 md:h-56 lg:h-64 rounded-none"
            : "h-36 rounded-2xl"
        )}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );

    return (
      <div
        className={cn(
          "w-full shrink-0 overflow-hidden relative",
          isHero && "self-stretch"
        )}
      >
        {bannerUrl ? (
          <a
            href={bannerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            {image}
          </a>
        ) : (
          image
        )}
        {/* Soft fade into page background so the cut isn't a hard edge */}
        {isHero && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18), transparent)",
            }}
          />
        )}
      </div>
    );
  }

  if (bannerText) {
    const content = bannerUrl ? (
      <a
        href={bannerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {bannerText}
      </a>
    ) : (
      bannerText
    );

    return (
      <div
        className={cn(
          "w-full shrink-0 px-4 py-2.5 text-sm font-medium text-center",
          variant === "hero" ? "rounded-none" : "rounded-xl",
          bannerStyle === "info" && "bg-blue-100 text-blue-800",
          bannerStyle === "success" && "bg-green-100 text-green-800",
          bannerStyle === "warning" && "bg-yellow-100 text-yellow-800",
          bannerStyle === "error" && "bg-red-100 text-red-800"
        )}
      >
        {content}
      </div>
    );
  }

  return null;
}
