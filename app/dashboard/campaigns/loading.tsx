import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function CampaignRowSkeleton() {
  return (
    <div className="bg-white border-b border-neutral-border px-4 py-3.5 last:border-b-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <Skeleton className="hidden sm:block h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function CampaignsLoading() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Campaign Studio"
        description="Group links, partners, spend, and analytics by initiative — then compare what wins"
        actions={
          <>
            <Skeleton className="h-10 w-28 rounded-full hidden sm:block" />
            <Link
              href="/docs/campaigns/creating-campaigns"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutral-border bg-white text-sm font-semibold text-neutral-text hover:border-primary/40 hover:text-primary"
            >
              <BookOpen className="h-4 w-4" />
              Studio guide
            </Link>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4" />
                New campaign
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <div className="space-y-0 rounded-2xl border border-neutral-border overflow-hidden bg-white shadow-soft">
          {[1, 2, 3, 4, 5].map((i) => (
            <CampaignRowSkeleton key={i} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
