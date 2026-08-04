export default function AnalyticsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header - Static, shows immediately */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-text mb-3">Analytics Overview</h1>
        <p className="text-lg text-neutral-muted">Track performance across all your links</p>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-border animate-pulse mb-4" />
            <div className="h-4 w-24 bg-neutral-border rounded-lg animate-pulse mb-2" />
            <div className="h-8 w-20 bg-neutral-border rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
          >
            <div className="h-5 w-40 bg-neutral-border rounded-lg animate-pulse mb-6" />
            <div className="h-64 w-full bg-neutral-border/60 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* Top Performing Links Skeleton */}
      <div className="rounded-card border border-neutral-border bg-white p-6 shadow-soft">
        <div className="h-5 w-48 bg-neutral-border rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-neutral-bg border border-neutral-border"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-border rounded-lg animate-pulse" />
                <div className="h-3 w-56 bg-neutral-border rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-12 bg-neutral-border rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
