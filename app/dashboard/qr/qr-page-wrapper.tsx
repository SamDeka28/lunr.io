"use client";

import { useState } from "react";
import { QRControls } from "./qr-controls";
import QRCodeList from "./qr-list";

interface QRPageWrapperProps {
  qrCodes: any[];
  canCreate: boolean;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
}

export function QRPageWrapper({
  qrCodes,
  canCreate,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
}: QRPageWrapperProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");

  return (
    <>
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
    </>
  );
}

