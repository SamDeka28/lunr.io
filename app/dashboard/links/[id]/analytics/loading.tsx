export default function LinkAnalyticsLoading() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-neutral-bg via-white to-neutral-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 bg-neutral-border rounded animate-pulse" />
            <div className="h-4 w-32 bg-neutral-border rounded animate-pulse" />
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-neutral-border rounded-2xl animate-pulse" />
                <div>
                  <div className="h-8 w-48 bg-neutral-border rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-40 bg-neutral-border rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Link Display Skeleton */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-neutral-border">
                  <div className="h-3 w-24 bg-neutral-border rounded mb-2 animate-pulse" />
                  <div className="h-5 w-64 bg-neutral-border rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-neutral-border rounded-xl animate-pulse" />
                <div className="h-12 w-12 bg-neutral-border rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft border border-neutral-border"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-border/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-neutral-border rounded-xl animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-neutral-border rounded mb-1 animate-pulse" />
                <div className="h-8 w-20 bg-neutral-border rounded mb-2 animate-pulse" />
                <div className="h-3 w-32 bg-neutral-border rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clicks Over Time Skeleton */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
                <div>
                  <div className="h-5 w-40 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                  <div className="h-3 w-24 bg-neutral-border rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-neutral-border rounded-full animate-pulse" />
            </div>
            <div className="h-64 bg-neutral-border/20 rounded-lg animate-pulse" />
          </div>

          {/* Traffic Sources Skeleton */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-36 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                <div className="h-3 w-32 bg-neutral-border rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-64 bg-neutral-border/20 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Additional Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution Skeleton */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-48 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                <div className="h-3 w-32 bg-neutral-border rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-64 bg-neutral-border/20 rounded-lg animate-pulse" />
          </div>

          {/* Link Details Skeleton */}
          <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                <div className="h-3 w-28 bg-neutral-border rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="h-3 w-24 bg-neutral-border rounded mb-2 animate-pulse" />
                <div className="h-12 w-full bg-neutral-border rounded-xl animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 w-16 bg-neutral-border rounded mb-2 animate-pulse" />
                  <div className="h-8 w-20 bg-neutral-border rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-neutral-border rounded mb-2 animate-pulse" />
                  <div className="h-8 w-24 bg-neutral-border rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

