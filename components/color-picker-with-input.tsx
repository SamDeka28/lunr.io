"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface ColorPickerWithInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPickerWithInput({ label, value, onChange }: ColorPickerWithInputProps) {
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

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2" ref={pickerRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="w-12 h-10 rounded-lg border-2 border-neutral-border cursor-pointer overflow-hidden"
            style={{ backgroundColor: value }}
          />
          {isPickerOpen && (
            <div className="absolute z-50 top-12 left-0 bg-white border-2 border-neutral-border rounded-lg shadow-lg p-2">
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                onBlur={() => setIsPickerOpen(false)}
                className="w-48 h-32 cursor-pointer border-0"
                autoFocus
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg border-2 border-neutral-border text-xs font-mono text-neutral-text bg-white focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
        />
      </div>
    </div>
  );
}

