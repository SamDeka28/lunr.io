import Link from "next/link";
import { CalendarOff, Clock } from "lucide-react";

export default async function CampaignInactivePage({
  params,
  searchParams,
}: {
  params: Promise<{ shortCode: string }>;
  searchParams: Promise<{ reason?: string; campaign?: string }>;
}) {
  const { shortCode } = await params;
  const { reason, campaign } = await searchParams;

  const isNotStarted = reason === "not_started";
  const title = isNotStarted ? "Campaign hasn't started" : "Campaign has ended";
  const description = isNotStarted
    ? "This link belongs to a campaign that is not active yet. Check back once the campaign window opens."
    : "This link belonged to a marketing campaign that is no longer running.";

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-neutral-border shadow-soft p-8 text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-neutral-surface flex items-center justify-center text-neutral-muted">
          {isNotStarted ? (
            <Clock className="h-7 w-7" />
          ) : (
            <CalendarOff className="h-7 w-7" />
          )}
        </div>
        <h1 className="text-2xl font-semibold text-neutral-text tracking-tight mb-2">
          {title}
        </h1>
        {campaign && (
          <p className="text-sm font-medium text-neutral-text mb-2">
            {campaign}
          </p>
        )}
        <p className="text-sm text-neutral-muted leading-relaxed mb-6">
          {description}
        </p>
        <p className="text-xs text-neutral-muted mb-6 font-mono">/{shortCode}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-button"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
