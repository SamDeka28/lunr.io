"use client";

import { useState } from "react";
import { HelpfulContent } from "../helpful-content";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function LinksPageClient({
  linkCount,
}: {
  linkCount: number;
}) {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="relative">
      {/* Right Column - Helpful Content */}
      {rightSidebarOpen && (
        <div className="space-y-6 relative">
          <HelpfulContent linkCount={linkCount} />
        </div>
      )}

      {/* Floating Collapse Button */}
      <button
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        className={cn(
          "absolute z-50 rounded-full bg-white border-2 border-neutral-border shadow-hover",
          "hover:bg-gradient-to-r hover:from-electric-sapphire/10 hover:to-bright-indigo/10 hover:border-electric-sapphire",
          "hover:text-electric-sapphire transition-all duration-200",
          "hidden lg:flex items-center justify-center",
          "group",
          rightSidebarOpen 
            ? "top-0 -right-4 w-8 h-8" 
            : "-right-4 top-0 w-8 h-8 rotate-180"
        )}
        title={rightSidebarOpen ? "Collapse tips" : "Expand tips"}
        aria-label={rightSidebarOpen ? "Collapse tips" : "Expand tips"}
      >
        {rightSidebarOpen ? (
          <ChevronRight className="h-4 w-4 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-neutral-muted group-hover:text-electric-sapphire transition-colors" />
        )}
      </button>
    </div>
  );
}

