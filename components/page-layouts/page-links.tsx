import { cn } from "@/lib/utils/cn";
import { getLinkButtonStyle } from "@/lib/utils/link-button-style";
import type { ButtonShadow, ButtonVariant } from "@/lib/utils/link-button-style";
import { PageLayoutProps } from "./types";

interface PageLinksProps {
  pageLinks: PageLayoutProps["pageLinks"];
  linkGap: number;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderRadius: number;
  buttonPadding: number;
  buttonFontWeight: number;
  buttonFontSize: number;
  buttonVariant: ButtonVariant;
  buttonShadow?: ButtonShadow;
  buttonTextAlignment?: "left" | "center" | "right";
  fontFamily: string;
  /** @deprecated use buttonTextAlignment */
  textAlignment?: "left" | "center" | "right";
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
  buttonFontSize,
  buttonVariant,
  buttonShadow = "soft",
  buttonTextAlignment,
  fontFamily,
  textAlignment = "center",
  ExternalLink,
  onLinkClick,
}: PageLinksProps) {
  if (pageLinks.length === 0) {
    return null;
  }

  const alignment = buttonTextAlignment || textAlignment;
  const justify =
    alignment === "left"
      ? "justify-start"
      : alignment === "right"
        ? "justify-end"
        : "justify-center";
  const textAlignClass =
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";

  return (
    <div
      className="w-full"
      style={{
        gap: `clamp(${Math.max(8, Math.round(linkGap * 0.75))}px, 2vw, ${linkGap}px)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {pageLinks.map((link) => {
        const linkContent = (
          <div className={cn("flex items-center gap-2 min-w-0", justify)}>
            <span className="truncate">{link.title}</span>
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          </div>
        );

        const linkStyle = getLinkButtonStyle({
          buttonColor,
          buttonTextColor,
          buttonVariant,
          buttonShadow,
          buttonFontSize,
          buttonFontWeight,
          buttonBorderRadius,
          buttonPadding,
          fontFamily,
        });

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
              }}
              className={cn(
                "w-full transition-all hover:opacity-90 active:scale-[0.98] block break-words",
                textAlignClass
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
              "w-full transition-all hover:opacity-90 active:scale-[0.98] break-words",
              textAlignClass
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
