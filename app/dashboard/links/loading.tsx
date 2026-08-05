import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function LinksLoading() {
  return (
    <DashboardContainer>
      <PageHeader
        title="Your Links"
        description="Loading…"
        actions={<Skeleton className="h-11 w-32 rounded-full" />}
      />

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 w-full sm:w-36 rounded-full" />
        <Skeleton className="h-11 w-full sm:w-28 rounded-full" />
      </div>

      <Skeleton className="h-14 w-full rounded-card" />

      <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft overflow-hidden divide-y divide-neutral-border/70">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-9 w-9 rounded-2xl" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-xl hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-xl hidden sm:block" />
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
}
