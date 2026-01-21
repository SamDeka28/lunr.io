import { cn } from "@/lib/utils/cn";
import { PageLayoutProps } from "./types";

interface PageLinksProps {
  pageLinks: PageLayoutProps["pageLinks"];
  linkGap: number;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderRadius: number;
  buttonPadding: number;
  buttonFontWeight: number;
  fontFamily: string;
  descriptionFontSize: number;
  textAlignment: "left" | "center" | "right";
  ExternalLink: React.ComponentType<any>;
  onLinkClick?: (linkId: string, url: string) => void;
}

export function PageLinks({
  pageLinks,
  linkGap,
  buttonColor,
  buttonTextColor,
  buttonBorderRadius,
  buttonPadding,
  buttonFontWeight,
  fontFamily,
  descriptionFontSize,
  textAlignment,
  ExternalLink,
  onLinkClick,
}: PageLinksProps) {
  if (pageLinks.length === 0) {
    return null;
  }

  const alignment = textAlignment === "left" ? "left" : "center";
  const justify = textAlignment === "left" ? "justify-start" : "justify-center";

  return (
    <div className="w-full" style={{ gap: `${linkGap}px`, display: "flex", flexDirection: "column" }}>
      {pageLinks.map((link) => {
        const linkContent = (
          <div className={cn("flex items-center gap-2", justify)}>
            {link.title}
            <ExternalLink className="h-4 w-4" />
          </div>
        );

        const linkStyle = {
          backgroundColor: buttonColor,
          color: buttonTextColor,
          padding: `${buttonPadding}px`,
          borderRadius: `${buttonBorderRadius}px`,
          fontFamily: `"${fontFamily}", sans-serif`,
          fontSize: `${descriptionFontSize}px`,
          fontWeight: buttonFontWeight,
        };

        if (onLinkClick) {
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                onLinkClick(link.id, link.url);
                window.open(link.url, "_blank", "noopener,noreferrer");
              }}
              className={cn(
                "w-full transition-all hover:opacity-90 active:scale-[0.98] shadow-soft block",
                `text-${alignment}`
              )}
              style={linkStyle}
            >
              {linkContent}
            </a>
          );
        }

        return (
          <div
            key={link.id}
            className={cn(
              "w-full transition-all hover:opacity-90 active:scale-[0.98] shadow-soft",
              `text-${alignment}`
            )}
            style={linkStyle}
          >
            {linkContent}
          </div>
        );
      })}
    </div>
  );
}

