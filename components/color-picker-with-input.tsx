"use client";

import { useState, useRef, useEffect } from "react";
import { SketchPicker, type ColorResult } from "react-color";
import { cn } from "@/lib/utils/cn";

interface ColorPickerWithInputProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  /** Hide alpha slider (default true — app colors are solid hex) */
  disableAlpha?: boolean;
  className?: string;
}

function colorToCss(color: ColorResult, disableAlpha: boolean): string {
  if (!disableAlpha && color.rgb.a !== undefined && color.rgb.a < 1) {
    const { r, g, b, a } = color.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color.hex;
}

export function ColorPickerWithInput({
  label,
  value,
  onChange,
  disabled = false,
  disableAlpha = true,
  className,
}: ColorPickerWithInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (disabled) setIsPickerOpen(false);
  }, [disabled]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2" ref={pickerRef}>
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) setIsPickerOpen((open) => !open);
            }}
            className={cn(
              "w-12 h-10 rounded-lg border-2 border-neutral-border overflow-hidden shrink-0",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
            style={{ backgroundColor: value }}
            aria-label={label ? `Pick ${label}` : "Pick color"}
          />
          {isPickerOpen && !disabled && (
            <div className="absolute z-50 top-12 left-0 shadow-lg rounded-lg">
              <SketchPicker
                color={value}
                disableAlpha={disableAlpha}
                onChange={(color) => onChange(colorToCss(color, disableAlpha))}
                presetColors={[
                  "#000000",
                  "#FFFFFF",
                  "#1A1A2E",
                  "#4F46E5",
                  "#2563EB",
                  "#0EA5E9",
                  "#10B981",
                  "#F59E0B",
                  "#EF4444",
                  "#EC4899",
                  "#8B5CF6",
                  "#64748B",
                ]}
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (!disabled) onChange(e.target.value);
          }}
          disabled={disabled}
          placeholder="#000000"
          className={cn(
            "flex-1 h-10 px-3 rounded-lg border-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
            disabled
              ? "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
              : "bg-white border-neutral-border text-neutral-text"
          )}
        />
      </div>
    </div>
  );
}
