"use client";

import { useState } from "react";
import { LinksControls } from "./links-controls";
import { LinksList } from "../links-list";
import { HelpfulContent } from "../helpful-content";
import { cn } from "@/lib/utils/cn";

interface LinksPageWrapperProps {
  links: any[];
  canCreate: boolean;
  linkCount: number;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
  initialTag?: string;
  initialFolder?: string;
}

export function LinksPageWrapper({
  links,
  canCreate,
  linkCount,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
  initialTag,
  initialFolder,
}: LinksPageWrapperProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");

  return (
    <div className="space-y-6">
      <LinksControls
        initialSearch={initialSearch}
        initialView={viewType}
        initialStatus={initialStatus}
        initialDateFilter={initialDateFilter}
        initialTag={initialTag}
        initialFolder={initialFolder}
        selectedCount={selectedCount}
        onViewChange={setViewType}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-9 min-w-0">
          <LinksList
            links={links}
            canCreate={canCreate}
            viewType={viewType}
            onSelectionChange={setSelectedCount}
          />
        </div>

        <div className={cn("hidden lg:block lg:col-span-4 xl:col-span-3")}>
          <div className="sticky top-24">
            <HelpfulContent linkCount={linkCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
