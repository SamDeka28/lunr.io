"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LinksControls } from "./links-controls";
import { LinksList } from "../links-list";
import { HelpfulContent } from "../helpful-content";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils/cn";
import type { ListPagination } from "@/lib/utils/pagination";

interface LinksPageWrapperProps {
  links: any[];
  canCreate: boolean;
  linkCount: number;
  pagination: ListPagination;
  initialSearch?: string;
  initialView?: "list" | "grid" | "card";
  initialStatus?: "active" | "all" | "archived";
  initialDateFilter?: string | null;
  initialTag?: string;
  initialFolder?: string;
  initialCampaignId?: string;
  availableFolders?: string[];
  availableTags?: string[];
}

export function LinksPageWrapper({
  links,
  canCreate,
  linkCount,
  pagination,
  initialSearch,
  initialView,
  initialStatus,
  initialDateFilter,
  initialTag,
  initialFolder,
  initialCampaignId,
  availableFolders = [],
  availableTags = [],
}: LinksPageWrapperProps) {
  const router = useRouter();
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewType, setViewType] = useState<"list" | "grid" | "card">(initialView || "list");
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <LinksControls
        initialSearch={initialSearch}
        initialView={viewType}
        initialStatus={initialStatus}
        initialDateFilter={initialDateFilter}
        initialTag={initialTag}
        initialFolder={initialFolder}
        initialCampaignId={initialCampaignId}
        availableFolders={availableFolders}
        availableTags={availableTags}
        selectedCount={selectedCount}
        onViewChange={setViewType}
        navigate={navigate}
        isPending={isPending}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-4">
          <LinksList
            links={links}
            canCreate={canCreate}
            viewType={viewType}
            onSelectionChange={setSelectedCount}
            isLoading={isPending}
          />
          <Pagination pagination={pagination} itemLabel="links" />
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
