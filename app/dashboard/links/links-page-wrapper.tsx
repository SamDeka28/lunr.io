"use client";

import { useState } from "react";
import { LinksControls } from "./links-controls";
import { LinksList } from "../links-list";
import { HelpfulContent } from "../helpful-content";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LinksPageWrapperProps {
  links: any[];
  canCreate: boolean;
  linkCount: number;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
}

export function LinksPageWrapper({
  links,
  canCreate,
  linkCount,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
}: LinksPageWrapperProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <>
      <LinksControls
        initialSearch={initialSearch}
        initialView={viewType}
        initialStatus={initialStatus}
        initialDateFilter={initialDateFilter}
        selectedCount={selectedCount}
        onViewChange={setViewType}
      />
      
      {/* Main Content Grid - Links List and Sidebar Side by Side */}
      <div className="relative mt-6">
        <div className={cn(
          "grid gap-6 transition-all duration-300",
          rightSidebarOpen ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>
          {/* Left Column - Links List */}
          <div className={cn(
            "transition-all duration-300",
            rightSidebarOpen ? "lg:col-span-2" : "lg:col-span-1"
          )}>
            <LinksList
              links={links}
              canCreate={canCreate}
              viewType={viewType}
              onSelectionChange={setSelectedCount}
            />
          </div>

          {/* Right Column - Helpful Content */}
          {rightSidebarOpen && (
            <div className="space-y-6 relative">
              <HelpfulContent linkCount={linkCount} />
            </div>
          )}
        </div>

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
    </>
  );
}

