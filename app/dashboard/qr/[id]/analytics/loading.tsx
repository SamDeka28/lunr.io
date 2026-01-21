export default function QRAnalyticsLoading() {
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
            </div>
          </div>
        </div>

        {/* QR Code Preview Skeleton */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="p-4 bg-white rounded-xl border border-neutral-border">
                  <div className="w-40 h-40 bg-neutral-border rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="h-6 w-32 bg-neutral-border rounded-lg mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg border border-neutral-border">
                    <div className="h-4 w-16 bg-neutral-border rounded animate-pulse" />
                    <div className="h-6 w-20 bg-neutral-border rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg border border-neutral-border">
                    <div className="h-4 w-20 bg-neutral-border rounded animate-pulse" />
                    <div className="h-4 w-4 bg-neutral-border rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 h-12 bg-neutral-border rounded-xl animate-pulse" />
                    <div className="h-12 w-12 bg-neutral-border rounded-xl animate-pulse" />
                    <div className="h-12 w-12 bg-neutral-border rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-neutral-border rounded-lg animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-neutral-border rounded mb-1 animate-pulse" />
              <div className="h-8 w-20 bg-neutral-border rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scans Over Time Skeleton */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
                <div>
                  <div className="h-5 w-36 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                  <div className="h-3 w-24 bg-neutral-border rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-neutral-border rounded-full animate-pulse" />
            </div>
            <div className="h-64 bg-neutral-border/20 rounded-lg animate-pulse" />
          </div>

          {/* Geographic Distribution Skeleton */}
          <div className="bg-white rounded-xl border border-neutral-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neutral-border rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-48 bg-neutral-border rounded-lg mb-1 animate-pulse" />
                <div className="h-3 w-32 bg-neutral-border rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-64 bg-neutral-border/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

