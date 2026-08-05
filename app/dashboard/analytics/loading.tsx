import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <DashboardContainer size="wide">
      <PageHeader
        title="Analytics"
        description="Loading…"
        actions={<Skeleton className="h-7 w-28 rounded-full" />}
      />

      <div className="rounded-card border border-neutral-border/80 bg-white p-5 shadow-soft space-y-3">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border/80 bg-white p-5 shadow-soft"
          >
            <div className="flex justify-between mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-2xl" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-card border border-neutral-border/80 bg-white p-6 shadow-soft">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border/80 bg-white p-6 shadow-soft"
          >
            <Skeleton className="h-5 w-36 mb-6" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
}
