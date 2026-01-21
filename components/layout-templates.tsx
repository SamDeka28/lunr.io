"use client";

import { cn } from "@/lib/utils/cn";
import { AlignCenter, Layout, Square, Columns, Minimize2, Image as ImageIcon, Grid3x3, Newspaper, Layers, Sparkles, Type, Briefcase, Move } from "lucide-react";

export interface LayoutTemplate {
  id: "centered" | "left" | "card" | "split" | "minimal" | "hero" | "sidebar" | "grid" | "magazine";
  name: string;
  description: string;
  icon: any;
  preview: string;
}

export const layoutTemplates: LayoutTemplate[] = [
  {
    id: "centered",
    name: "Classic Centered",
    description: "Traditional centered layout",
    icon: AlignCenter,
    preview: "All content centered with balanced spacing",
  },
  {
    id: "left",
    name: "Asymmetric",
    description: "Offset profile with flowing content",
    icon: Move,
    preview: "Dynamic asymmetric layout with offset elements",
  },
  {
    id: "card",
    name: "Glassmorphism",
    description: "Frosted glass card effect",
    icon: Sparkles,
    preview: "Modern glassmorphism with backdrop blur",
  },
  {
    id: "hero",
    name: "Hero Style",
    description: "Large profile with content below",
    icon: ImageIcon,
    preview: "Bold hero section with prominent profile",
  },
  {
    id: "sidebar",
    name: "Portfolio",
    description: "Professional portfolio layout",
    icon: Briefcase,
    preview: "Structured portfolio with sections",
  },
  {
    id: "split",
    name: "Split Screen",
    description: "Two-column split layout",
    icon: Columns,
    preview: "Split screen with balanced columns",
  },
  {
    id: "grid",
    name: "Grid Style",
    description: "Organized grid layout",
    icon: Grid3x3,
    preview: "Content arranged in clean grid",
  },
  {
    id: "magazine",
    name: "Magazine Style",
    description: "Editorial magazine layout",
    icon: Newspaper,
    preview: "Editorial style with distinct sections",
  },
  {
    id: "minimal",
    name: "Bold Typography",
    description: "Typography-focused design",
    icon: Type,
    preview: "Large bold typography with minimal elements",
  },
];

interface LayoutTemplatesProps {
  onSelect: (template: LayoutTemplate["id"]) => void;
  currentTemplate: LayoutTemplate["id"];
}

export function LayoutTemplates({ onSelect, currentTemplate }: LayoutTemplatesProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-text mb-3 uppercase tracking-wide">
        Choose a Layout
      </label>
      <div className="grid grid-cols-2 gap-3">
        {layoutTemplates.map((template) => {
          const Icon = template.icon;
          const isActive = currentTemplate === template.id;
          
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={cn(
                "relative group rounded-xl overflow-hidden border-2 transition-all text-left p-4",
                isActive
                  ? "border-electric-sapphire ring-2 ring-electric-sapphire/40 bg-electric-sapphire/5"
                  : "border-neutral-border hover:border-electric-sapphire/50 bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-electric-sapphire text-white" : "bg-neutral-bg text-neutral-muted"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-neutral-text mb-0.5">
                    {template.name}
                  </div>
                  <div className="text-[10px] text-neutral-muted line-clamp-2">
                    {template.description}
                  </div>
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

