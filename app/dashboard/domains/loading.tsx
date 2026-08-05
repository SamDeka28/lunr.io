import { DashboardContainer } from "@/components/ui/dashboard-container";
export default function DomainsLoading() {
  return (
    <DashboardContainer>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-border rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-neutral-border rounded-lg animate-pulse" />
        </div>
        <div className="h-11 w-36 bg-neutral-border rounded-xl animate-pulse" />
      </div>

      {/* Domain Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-border animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-56 bg-neutral-border rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-neutral-border rounded-lg animate-pulse" />
              </div>
              <div className="h-7 w-24 bg-neutral-border rounded-full animate-pulse" />
            </div>
            <div className="h-24 w-full bg-neutral-bg border border-neutral-border rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
}
