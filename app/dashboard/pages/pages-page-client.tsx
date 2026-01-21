"use client";

import { useState } from "react";
import { PagesControls } from "./pages-controls";
import PagesList from "./pages-list";

interface PagesPageClientProps {
  pages: any[];
  canCreate: boolean;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
}

export function PagesPageClient({
  pages,
  canCreate,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
}: PagesPageClientProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");

  return (
    <>
      <PagesControls
        initialSearch={initialSearch}
        initialView={viewType}
        initialStatus={initialStatus}
        initialDateFilter={initialDateFilter}
        selectedCount={selectedCount}
        onViewChange={setViewType}
      />
      <PagesList
        pages={pages}
        canCreate={canCreate}
        viewType={viewType}
        onSelectionChange={setSelectedCount}
      />
    </>
  );
}

