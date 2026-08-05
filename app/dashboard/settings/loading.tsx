import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <DashboardContainer>
      <PageHeader title="Settings" description="Loading…" />

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="flex flex-col md:flex-row gap-5">
            <aside className="md:w-52 shrink-0">
              <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-2 space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-2xl" />
                ))}
              </div>
            </aside>
            <div className="flex-1 rounded-card border border-neutral-border/80 bg-white shadow-soft p-6 sm:p-7 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-12 w-full rounded-2xl mt-4" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="rounded-card border border-neutral-border/80 bg-white shadow-soft p-5 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
