import type { CSSProperties } from "react";
import { fluidButton } from "@/lib/utils/fluid-type";

export type ButtonVariant = "filled" | "outlined" | "soft" | "glass";
export type ButtonShadow = "none" | "soft" | "strong";
export type ButtonThemeId = "solid" | "soft" | "outline" | "pill" | "glass" | "flat";

export interface ButtonThemePreset {
  id: ButtonThemeId;
  label: string;
  description: string;
  buttonVariant: ButtonVariant;
  buttonBorderRadius: number;
  buttonShadow: ButtonShadow;
  buttonPadding?: number;
}

export const BUTTON_THEME_PRESETS: ButtonThemePreset[] = [
  {
    id: "solid",
    label: "Solid",
    description: "Filled with soft shadow",
    buttonVariant: "filled",
    buttonBorderRadius: 12,
    buttonShadow: "soft",
    buttonPadding: 16,
  },
  {
    id: "soft",
    label: "Soft",
    description: "Tinted fill, colored text",
    buttonVariant: "soft",
    buttonBorderRadius: 14,
    buttonShadow: "none",
    buttonPadding: 16,
  },
  {
    id: "outline",
    label: "Outline",
    description: "Border only",
    buttonVariant: "outlined",
    buttonBorderRadius: 12,
    buttonShadow: "none",
    buttonPadding: 16,
  },
  {
    id: "pill",
    label: "Pill",
    description: "Fully rounded",
    buttonVariant: "filled",
    buttonBorderRadius: 999,
    buttonShadow: "soft",
    buttonPadding: 16,
  },
  {
    id: "glass",
    label: "Glass",
    description: "Frosted translucent",
    buttonVariant: "glass",
    buttonBorderRadius: 14,
    buttonShadow: "soft",
    buttonPadding: 16,
  },
  {
    id: "flat",
    label: "Flat",
    description: "No shadow, sharp",
    buttonVariant: "filled",
    buttonBorderRadius: 8,
    buttonShadow: "none",
    buttonPadding: 14,
  },
];

export function getButtonThemePreset(id?: string | null): ButtonThemePreset {
  return BUTTON_THEME_PRESETS.find((p) => p.id === id) || BUTTON_THEME_PRESETS[0];
}

export interface LinkButtonStyleInput {
  buttonColor: string;
  buttonTextColor: string;
  buttonVariant?: ButtonVariant;
  buttonShadow?: ButtonShadow;
  buttonFontSize: number;
  buttonFontWeight: number;
  buttonBorderRadius: number;
  buttonPadding: number;
  fontFamily: string;
  /** Extra vertical/horizontal padding multiplier (e.g. featured links) */
  paddingScale?: number;
  /** When false, keep exact px (e.g. dense grid tiles) */
  fluid?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (full.length !== 6 || Number.isNaN(parseInt(full, 16))) {
    return `rgba(59, 130, 246, ${alpha})`;
  }
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getButtonShadowStyle(
  shadow: ButtonShadow = "soft",
  buttonColor?: string
): string | undefined {
  if (shadow === "none") return undefined;
  if (shadow === "strong") {
    return buttonColor
      ? `0 8px 24px ${hexToRgba(buttonColor, 0.35)}, 0 2px 6px rgba(0,0,0,0.12)`
      : "0 8px 24px rgba(0,0,0,0.18)";
  }
  return buttonColor
    ? `0 4px 14px ${hexToRgba(buttonColor, 0.22)}, 0 1px 3px rgba(0,0,0,0.06)`
    : "0 4px 14px rgba(0,0,0,0.1)";
}

/** Shared filled / outlined / soft / glass styles for page link buttons */
export function getLinkButtonStyle({
  buttonColor,
  buttonTextColor,
  buttonVariant = "filled",
  buttonShadow = "soft",
  buttonFontSize,
  buttonFontWeight,
  buttonBorderRadius,
  buttonPadding,
  fontFamily,
  paddingScale = 1,
  fluid = true,
}: LinkButtonStyleInput): CSSProperties {
  const padY = Math.round(buttonPadding * paddingScale);
  const padX = Math.round(buttonPadding * paddingScale * (paddingScale > 1 ? 1.15 : 1));
  const radius =
    buttonBorderRadius >= 999
      ? 9999
      : buttonBorderRadius;

  const base: CSSProperties = {
    padding: fluid
      ? `clamp(${Math.round(padY * 0.85)}px, 2.5vw, ${padY}px) clamp(${Math.round(padX * 0.85)}px, 3vw, ${padX}px)`
      : `${padY}px ${padX}px`,
    borderRadius: `${radius}px`,
    fontFamily: `"${fontFamily}", sans-serif`,
    fontSize: fluid ? fluidButton(buttonFontSize) : `${buttonFontSize}px`,
    fontWeight: buttonFontWeight,
    boxSizing: "border-box",
    boxShadow: getButtonShadowStyle(buttonShadow, buttonColor),
    backdropFilter: undefined,
    WebkitBackdropFilter: undefined,
  };

  if (buttonVariant === "outlined") {
    return {
      ...base,
      backgroundColor: "transparent",
      color: buttonColor,
      border: `2px solid ${buttonColor}`,
      boxShadow: getButtonShadowStyle(buttonShadow === "soft" ? "none" : buttonShadow, buttonColor),
    };
  }

  if (buttonVariant === "soft") {
    return {
      ...base,
      backgroundColor: hexToRgba(buttonColor, 0.14),
      color: buttonColor,
      border: `2px solid ${hexToRgba(buttonColor, 0.2)}`,
      boxShadow: getButtonShadowStyle(buttonShadow === "soft" ? "none" : buttonShadow, buttonColor),
    };
  }

  if (buttonVariant === "glass") {
    return {
      ...base,
      backgroundColor: hexToRgba(buttonColor, 0.18),
      color: buttonTextColor === "#FFFFFF" || buttonTextColor?.toLowerCase() === "#fff"
        ? buttonColor
        : buttonTextColor,
      border: `1px solid ${hexToRgba(buttonColor, 0.35)}`,
      backdropFilter: "blur(12px) saturate(1.3)",
      WebkitBackdropFilter: "blur(12px) saturate(1.3)",
      boxShadow: getButtonShadowStyle(buttonShadow, buttonColor),
    };
  }

  // filled
  return {
    ...base,
    backgroundColor: buttonColor,
    color: buttonTextColor,
    border: "2px solid transparent",
  };
}
