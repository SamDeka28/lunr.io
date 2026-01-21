"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const fonts = [
  { name: "Inter", family: "Inter" },
  { name: "Roboto", family: "Roboto" },
  { name: "Open Sans", family: "Open Sans" },
  { name: "Lato", family: "Lato" },
  { name: "Montserrat", family: "Montserrat" },
  { name: "Poppins", family: "Poppins" },
  { name: "Playfair Display", family: "Playfair Display" },
  { name: "Merriweather", family: "Merriweather" },
  { name: "Raleway", family: "Raleway" },
  { name: "Nunito", family: "Nunito" },
];

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all Google Fonts on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fonts.forEach(font => {
        const fontName = font.family.replace(/\s+/g, "+");
        const linkId = `google-font-${fontName}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement("link");
          link.id = linkId;
          link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedFont = fonts.find(f => f.family === value) || fonts[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-3 rounded-lg border-2 border-neutral-border bg-white",
          "text-neutral-text text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
          "flex items-center justify-between"
        )}
      >
        <span style={{ fontFamily: `"${selectedFont.family}", sans-serif` }}>
          {selectedFont.name}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-neutral-muted transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-neutral-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font.family}
              type="button"
              onClick={() => {
                onChange(font.family);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2.5 text-left hover:bg-neutral-bg transition-colors",
                "flex items-center justify-between",
                value === font.family && "bg-electric-sapphire/10"
              )}
            >
              <span
                style={{ fontFamily: `"${font.family}", sans-serif` }}
                className="text-sm font-medium text-neutral-text"
              >
                {font.name}
              </span>
              {value === font.family && (
                <div className="w-2 h-2 rounded-full bg-electric-sapphire" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

