export default function SettingsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <h1 className="text-4xl font-bold text-neutral-text mb-8">Settings</h1>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Settings Content Skeleton */}
        <div className="lg:col-span-9 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-card border border-neutral-border bg-white p-6 shadow-soft"
            >
              <div className="h-5 w-40 bg-neutral-border rounded-lg animate-pulse mb-6" />
              <div className="space-y-4">
                <div className="h-11 w-full bg-neutral-border/70 rounded-xl animate-pulse" />
                <div className="h-11 w-full bg-neutral-border/70 rounded-xl animate-pulse" />
                <div className="h-11 w-2/3 bg-neutral-border/70 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Plan Info Skeleton */}
        <div className="lg:col-span-3">
          <div className="rounded-card border border-neutral-border bg-white p-6 shadow-soft">
            <div className="h-5 w-28 bg-neutral-border rounded-lg animate-pulse mb-6" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-neutral-border rounded-lg animate-pulse" />
              <div className="h-2.5 w-full bg-neutral-border rounded-full animate-pulse" />
              <div className="h-4 w-full bg-neutral-border rounded-lg animate-pulse" />
              <div className="h-2.5 w-full bg-neutral-border rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
