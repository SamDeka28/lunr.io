"use client";

import { useState } from "react";
import { QRControls } from "./qr-controls";
import QRCodeList from "./qr-list";
import { Pagination } from "@/components/ui/pagination";
import type { ListPagination } from "@/lib/utils/pagination";

interface QRPageWrapperProps {
  qrCodes: any[];
  canCreate: boolean;
  pagination: ListPagination;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
}

export function QRPageWrapper({
  qrCodes,
  canCreate,
  pagination,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
}: QRPageWrapperProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");

  return (
    <div className="space-y-4">
      <QRControls
        initialSearch={initialSearch}
        initialView={viewType}
        initialStatus={initialStatus}
        initialDateFilter={initialDateFilter}
        selectedCount={selectedCount}
        onViewChange={setViewType}
      />
      <QRCodeList
        qrCodes={qrCodes}
        canCreate={canCreate}
        viewType={viewType}
        onSelectionChange={setSelectedCount}
      />
      <Pagination pagination={pagination} itemLabel="QR codes" />
    </div>
  );
}
