"use client";

import { cn } from "@/lib/utils/cn";

export const gradientTemplates = [
  { name: "Ocean Blue", start: "#667eea", end: "#764ba2" },
  { name: "Sunset", start: "#f093fb", end: "#f5576c" },
  { name: "Forest", start: "#4facfe", end: "#00f2fe" },
  { name: "Purple Dream", start: "#a8edea", end: "#fed6e3" },
  { name: "Fire", start: "#fa709a", end: "#fee140" },
  { name: "Cool Blue", start: "#30cfd0", end: "#330867" },
  { name: "Warm Orange", start: "#fad961", end: "#f76b1c" },
  { name: "Green Mint", start: "#0ba360", end: "#3cba92" },
  { name: "Pink Purple", start: "#fbc2eb", end: "#a6c1ee" },
  { name: "Dark Blue", start: "#2c3e50", end: "#3498db" },
  { name: "Lavender", start: "#e056fd", end: "#f0932b" },
  { name: "Teal", start: "#0c3487", end: "#a2b6df" },
];

interface GradientTemplatesProps {
  onSelect: (start: string, end: string) => void;
  currentStart: string;
  currentEnd: string;
}

export function GradientTemplates({ onSelect, currentStart, currentEnd }: GradientTemplatesProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-text mb-3 uppercase tracking-wide">
        Gradient Templates
      </label>
      <div className="grid grid-cols-3 gap-2">
        {gradientTemplates.map((template) => {
          const isActive = currentStart === template.start && currentEnd === template.end;
          return (
            <button
              key={template.name}
              type="button"
              onClick={() => onSelect(template.start, template.end)}
              className={cn(
                "relative h-16 rounded-lg border-2 overflow-hidden transition-all group",
                isActive
                  ? "border-electric-sapphire ring-2 ring-electric-sapphire/40"
                  : "border-neutral-border hover:border-electric-sapphire/50"
              )}
              style={{
                background: `linear-gradient(135deg, ${template.start} 0%, ${template.end} 100%)`,
              }}
              title={template.name}
            >
              {isActive && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 truncate">
                {template.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

