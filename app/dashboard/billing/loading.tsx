export default function BillingLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 bg-neutral-border rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-neutral-border rounded-lg animate-pulse" />
      </div>

      {/* Current Plan Skeleton */}
      <div className="rounded-card border border-neutral-border bg-white p-6 shadow-soft mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-neutral-border rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-neutral-border rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-neutral-border rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Plan Options Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="h-6 w-24 bg-neutral-border rounded-lg animate-pulse mb-4" />
            <div className="h-9 w-32 bg-neutral-border rounded-lg animate-pulse mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 w-full bg-neutral-border rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-11 w-full bg-neutral-border rounded-xl animate-pulse mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
