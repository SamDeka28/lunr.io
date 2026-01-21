export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-electric-sapphire/20 border-t-electric-sapphire rounded-full animate-spin"></div>
        <p className="text-sm text-neutral-muted">Loading...</p>
      </div>
    </div>
  );
}
