import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignWorkspaceLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-3 w-28" />
      </div>

      <div
        className="rounded-2xl border border-neutral-border/80 shadow-soft overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(67,97,238,0.06), transparent 45%), #F3F5FA",
        }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-neutral-border/70 bg-white/85 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        <div className="px-4 py-3 border-b border-neutral-border/70 bg-neutral-surface/40">
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/80 border border-neutral-border/70 rounded-full shadow-soft">
            {["Overview", "Links", "Analytics"].map((label) => (
              <Skeleton
                key={label}
                className="h-9 w-[5.25rem] rounded-full flex-shrink-0"
              />
            ))}
            <Skeleton className="h-9 w-20 rounded-full flex-shrink-0 ml-auto" />
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-card border border-neutral-border/80 bg-white p-5 shadow-soft space-y-3"
              >
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
