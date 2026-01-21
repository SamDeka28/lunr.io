"use client";

import { cn } from "@/lib/utils/cn";

interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}

export function SliderWithInput({ label, value, onChange, min, max, unit = "px" }: SliderWithInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const numValue = Number(e.target.value);
              if (!isNaN(numValue) && numValue >= min && numValue <= max) {
                onChange(numValue);
              }
            }}
            min={min}
            max={max}
            className="w-16 h-8 px-2 rounded-lg border-2 border-neutral-border text-xs font-semibold text-neutral-text bg-white text-center focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
          />
          <span className="text-xs text-neutral-muted font-medium">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-electric-sapphire"
      />
      <div className="flex justify-between text-xs text-neutral-muted mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

