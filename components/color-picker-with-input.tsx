"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

type PickerCoords = {
  top?: number;
  bottom?: number;
  left: number;
};

export function ColorPickerWithInput({
  label,
  value,
  onChange,
  disabled = false,
  disableAlpha = true,
  className,
}: ColorPickerWithInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PickerCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const padding = 8;
    const pickerHeight = 320;
    const pickerWidth = 220;
    const spaceBelow = window.innerHeight - rect.bottom - gap - padding;
    const spaceAbove = rect.top - gap - padding;
    const preferBottom = spaceBelow >= pickerHeight || spaceBelow >= spaceAbove;

    let left = rect.left;
    if (left + pickerWidth > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - pickerWidth - padding);
    }

    if (preferBottom) {
      setCoords({ top: rect.bottom + gap, left });
    } else {
      setCoords({ bottom: window.innerHeight - rect.top + gap, left });
    }
  }, []);

  useEffect(() => {
    if (!isPickerOpen) return;
    updatePosition();
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (pickerPanelRef.current?.contains(target)) return;
      setIsPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPickerOpen(false);
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
  }, [isPickerOpen, updatePosition]);

  useEffect(() => {
    if (disabled) setIsPickerOpen(false);
  }, [disabled]);

  const picker =
    mounted &&
    isPickerOpen &&
    !disabled &&
    coords &&
    createPortal(
      <div
        ref={pickerPanelRef}
        style={{
          position: "fixed",
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          zIndex: 9999,
        }}
        className="shadow-lg rounded-lg"
      >
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
      </div>,
      document.body
    );

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            ref={triggerRef}
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
          {picker}
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
