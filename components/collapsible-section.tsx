"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export function CollapsibleSection({
  title,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  defaultOpen = false,
  children,
  icon: Icon,
}: CollapsibleSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div className="bg-white rounded-card border border-neutral-border p-6 shadow-soft mb-6">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="h-4 w-4 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
          )}
          <span className="text-base font-bold text-neutral-text">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-4 animate-slide-reveal">
          {children}
        </div>
      )}
    </div>
  );
}





