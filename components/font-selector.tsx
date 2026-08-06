"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

type MenuCoords = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load all Google Fonts on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fonts.forEach((font) => {
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

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 4;
    const padding = 8;
    const width = rect.width;
    const spaceBelow = window.innerHeight - rect.bottom - gap - padding;
    const spaceAbove = rect.top - gap - padding;
    const preferBottom = spaceBelow >= 200 || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(160, Math.min(256, preferBottom ? spaceBelow : spaceAbove));

    if (preferBottom) {
      setCoords({
        top: rect.bottom + gap,
        left: rect.left,
        width,
        maxHeight,
      });
    } else {
      setCoords({
        bottom: window.innerHeight - rect.top + gap,
        left: rect.left,
        width,
        maxHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const onScrollOrResize = () => updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const selectedFont = fonts.find((f) => f.family === value) || fonts[0];

  const menu =
    mounted &&
    isOpen &&
    coords &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxHeight,
          zIndex: 9999,
        }}
        className="bg-white border-2 border-neutral-border rounded-lg shadow-lg overflow-y-auto"
      >
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
      </div>,
      document.body
    );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
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
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {menu}
    </div>
  );
}
