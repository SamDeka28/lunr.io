export default function NewPageLoading() {
  return (
    <div
      className="flex h-[calc(100dvh-3.75rem)]"
      style={{
        background:
          "radial-gradient(120% 80% at 100% 0%, rgba(67,97,238,0.06), transparent 45%), #F3F5FA",
      }}
    >
      <div className="w-[22rem] xl:w-96 bg-white/85 backdrop-blur-xl border-r border-neutral-border/70 shadow-soft flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-neutral-border/70 space-y-2">
          <div className="h-6 w-32 rounded-lg bg-neutral-surface animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-neutral-surface/80 animate-pulse" />
        </div>
        <div className="px-3 py-3 border-b border-neutral-border/70">
          <div className="h-12 rounded-full bg-white border border-neutral-border/70 shadow-soft animate-pulse" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-neutral-surface animate-pulse" />
              <div className="h-11 rounded-xl bg-neutral-surface/80 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-neutral-border/70">
          <div className="h-11 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3.5 border-b border-neutral-border/70 bg-white/80 flex items-center justify-between">
          <div className="h-9 w-40 rounded-2xl bg-neutral-surface animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-neutral-surface animate-pulse" />
        </div>
        <div className="flex-1 p-8">
          <div className="h-full min-h-[28rem] rounded-card bg-white/70 border border-neutral-border/60 shadow-soft animate-pulse" />
        </div>
      </div>
    </div>
  );
}
