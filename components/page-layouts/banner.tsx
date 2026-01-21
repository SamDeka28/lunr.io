import { cn } from "@/lib/utils/cn";
import { PageLayoutProps } from "./types";

interface BannerProps {
  bannerText: string;
  bannerImageUrl: string;
  bannerUrl: string;
  bannerStyle: PageLayoutProps["bannerStyle"];
  bannerType: PageLayoutProps["bannerType"];
  maxContentWidth: number;
}

export function Banner({ 
  bannerText, 
  bannerImageUrl, 
  bannerUrl, 
  bannerStyle, 
  bannerType,
  maxContentWidth 
}: BannerProps) {
  if (bannerType === "image" && bannerImageUrl) {
    return (
      <div className="w-full" style={{ maxWidth: `${maxContentWidth}px` }}>
        {bannerUrl ? (
          <a href={bannerUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={bannerImageUrl}
              alt="Banner"
              className="w-full h-auto rounded-lg object-cover"
              style={{ maxHeight: "200px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </a>
        ) : (
          <img
            src={bannerImageUrl}
            alt="Banner"
            className="w-full h-auto rounded-lg object-cover"
            style={{ maxHeight: "200px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>
    );
  }

  if (bannerText) {
    return (
      <div
        className={cn(
          "w-full px-4 py-2 text-sm font-medium text-center rounded-lg",
          bannerStyle === "info" && "bg-blue-100 text-blue-800",
          bannerStyle === "success" && "bg-green-100 text-green-800",
          bannerStyle === "warning" && "bg-yellow-100 text-yellow-800",
          bannerStyle === "error" && "bg-red-100 text-red-800"
        )}
        style={{ maxWidth: `${maxContentWidth}px` }}
      >
        {bannerUrl ? (
          <a href={bannerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {bannerText}
          </a>
        ) : (
          bannerText
        )}
      </div>
    );
  }

  return null;
}

