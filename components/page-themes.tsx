"use client";

import { cn } from "@/lib/utils/cn";

export interface PageTheme {
  name: string;
  description: string;
  preview: {
    background: string;
    gradient?: { start: string; end: string };
  };
  settings: {
    backgroundColor: string;
    backgroundType: "solid" | "gradient";
    gradientColors?: { start: string; end: string };
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    fontFamily: string;
    titleFontSize: number;
    descriptionFontSize: number;
    titleFontWeight: number;
    descriptionFontWeight: number;
    buttonFontWeight: number;
    buttonBorderRadius: number;
    buttonPadding: number;
    socialIconStyle: "filled" | "outlined" | "minimal";
    socialIconShape: "circle" | "square" | "rounded";
  };
}

export const defaultThemes: PageTheme[] = [
  {
    name: "Ocean Breeze",
    description: "Calm blue gradient with modern typography",
    preview: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      gradient: { start: "#667eea", end: "#764ba2" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#667eea", end: "#764ba2" },
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: "#667eea",
      fontFamily: "Inter",
      titleFontSize: 48,
      descriptionFontSize: 18,
      titleFontWeight: 700,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 12,
      buttonPadding: 16,
      socialIconStyle: "filled",
      socialIconShape: "circle",
    },
  },
  {
    name: "Sunset Glow",
    description: "Warm orange and pink gradient",
    preview: {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      gradient: { start: "#f093fb", end: "#f5576c" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#f093fb", end: "#f5576c" },
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: "#f5576c",
      fontFamily: "Poppins",
      titleFontSize: 52,
      descriptionFontSize: 18,
      titleFontWeight: 700,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 16,
      buttonPadding: 18,
      socialIconStyle: "outlined",
      socialIconShape: "rounded",
    },
  },
  {
    name: "Forest Green",
    description: "Natural green tones with clean design",
    preview: {
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      gradient: { start: "#4facfe", end: "#00f2fe" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#4facfe", end: "#00f2fe" },
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: "#4facfe",
      fontFamily: "Montserrat",
      titleFontSize: 50,
      descriptionFontSize: 17,
      titleFontWeight: 700,
      descriptionFontWeight: 500,
      buttonFontWeight: 600,
      buttonBorderRadius: 10,
      buttonPadding: 16,
      socialIconStyle: "minimal",
      socialIconShape: "circle",
    },
  },
  {
    name: "Minimal White",
    description: "Clean white background with dark text",
    preview: {
      background: "#FFFFFF",
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "solid",
      textColor: "#1F2937",
      buttonColor: "#3B82F6",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Inter",
      titleFontSize: 48,
      descriptionFontSize: 18,
      titleFontWeight: 700,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 8,
      buttonPadding: 16,
      socialIconStyle: "outlined",
      socialIconShape: "circle",
    },
  },
  {
    name: "Dark Mode",
    description: "Elegant dark theme with vibrant accents",
    preview: {
      background: "#111827",
    },
    settings: {
      backgroundColor: "#111827",
      backgroundType: "solid",
      textColor: "#F9FAFB",
      buttonColor: "#3B82F6",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Inter",
      titleFontSize: 48,
      descriptionFontSize: 18,
      titleFontWeight: 700,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 12,
      buttonPadding: 16,
      socialIconStyle: "filled",
      socialIconShape: "rounded",
    },
  },
  {
    name: "Purple Dream",
    description: "Soft purple gradient with elegant typography",
    preview: {
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      gradient: { start: "#a8edea", end: "#fed6e3" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#a8edea", end: "#fed6e3" },
      textColor: "#1F2937",
      buttonColor: "#8B5CF6",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Raleway",
      titleFontSize: 50,
      descriptionFontSize: 18,
      titleFontWeight: 600,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 14,
      buttonPadding: 16,
      socialIconStyle: "filled",
      socialIconShape: "circle",
    },
  },
  {
    name: "Fire Orange",
    description: "Bold orange gradient with high contrast",
    preview: {
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      gradient: { start: "#fa709a", end: "#fee140" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#fa709a", end: "#fee140" },
      textColor: "#1F2937",
      buttonColor: "#FFFFFF",
      buttonTextColor: "#DC2626",
      fontFamily: "Poppins",
      titleFontSize: 52,
      descriptionFontSize: 18,
      titleFontWeight: 800,
      descriptionFontWeight: 500,
      buttonFontWeight: 700,
      buttonBorderRadius: 12,
      buttonPadding: 18,
      socialIconStyle: "filled",
      socialIconShape: "rounded",
    },
  },
  {
    name: "Cool Blue",
    description: "Professional blue gradient",
    preview: {
      background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      gradient: { start: "#30cfd0", end: "#330867" },
    },
    settings: {
      backgroundColor: "#FFFFFF",
      backgroundType: "gradient",
      gradientColors: { start: "#30cfd0", end: "#330867" },
      textColor: "#FFFFFF",
      buttonColor: "#FFFFFF",
      buttonTextColor: "#330867",
      fontFamily: "Montserrat",
      titleFontSize: 48,
      descriptionFontSize: 18,
      titleFontWeight: 700,
      descriptionFontWeight: 400,
      buttonFontWeight: 600,
      buttonBorderRadius: 10,
      buttonPadding: 16,
      socialIconStyle: "outlined",
      socialIconShape: "circle",
    },
  },
];

interface PageThemesProps {
  onSelect: (theme: PageTheme) => void;
  currentTheme?: Partial<PageTheme["settings"]>;
}

export function PageThemes({ onSelect, currentTheme }: PageThemesProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-text mb-3 uppercase tracking-wide">
        Choose a Theme
      </label>
      <div className="grid grid-cols-2 gap-3">
        {defaultThemes.map((theme) => {
          const isActive = currentTheme && 
            currentTheme.backgroundType === theme.settings.backgroundType &&
            currentTheme.backgroundColor === theme.settings.backgroundColor &&
            currentTheme.textColor === theme.settings.textColor &&
            currentTheme.buttonColor === theme.settings.buttonColor;
          
          return (
            <button
              key={theme.name}
              type="button"
              onClick={() => onSelect(theme)}
              className={cn(
                "relative group rounded-xl overflow-hidden border-2 transition-all text-left",
                isActive
                  ? "border-electric-sapphire ring-2 ring-electric-sapphire/40"
                  : "border-neutral-border hover:border-electric-sapphire/50"
              )}
            >
              <div
                className="h-20 w-full"
                style={{
                  background: theme.preview.background,
                }}
              />
              <div className="p-3 bg-white">
                <div className="text-xs font-bold text-neutral-text mb-0.5">
                  {theme.name}
                </div>
                <div className="text-[10px] text-neutral-muted line-clamp-1">
                  {theme.description}
                </div>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-electric-sapphire flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

