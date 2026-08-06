"use client";

import { useState } from "react";
import { PagesControls } from "./pages-controls";
import PagesList from "./pages-list";
import { Pagination } from "@/components/ui/pagination";
import type { ListPagination } from "@/lib/utils/pagination";

interface PagesPageClientProps {
  pages: any[];
  canCreate: boolean;
  pagination: ListPagination;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
}

export function PagesPageClient({
  pages,
  canCreate,
  pagination,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
}: PagesPageClientProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");

  return (
    <div className="space-y-4">
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
      <Pagination pagination={pagination} itemLabel="pages" />
    </div>
  );
}
