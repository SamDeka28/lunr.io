import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { TrendingUp, Link2, QrCode, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { QuickCreateCard } from "./quick-create-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);

  const [linksResult, qrResult, limits] = await Promise.all([
    supabase
      .from("links")
      .select("id, click_count")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("qr_codes")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true),
    planService.getUsageLimits(user.id),
  ]);

  const links = linksResult.data;
  const qrCodes = qrResult.data;

  const linkCount = links?.length || 0;
  const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;
  const qrCount = qrCodes?.length || 0;
  const remainingLinks = limits.remaining_links === -1 ? Infinity : limits.remaining_links;

  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageHeader
        title="Welcome back"
        description="Here's what's happening with your links today"
      />

      <div className="mb-8">
        <QuickCreateCard
          remainingLinks={remainingLinks}
          canCreateLink={limits.can_create_link}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Links"
          value={linkCount}
          icon={<Link2 className="h-5 w-5" />}
          accent="primary"
          hint={
            <Link
              href="/dashboard/links"
              className="text-primary font-semibold hover:underline"
            >
              View all →
            </Link>
          }
        />
        <StatCard
          label="Total Clicks"
          value={totalClicks}
          icon={<TrendingUp className="h-5 w-5" />}
          hint={
            <Link
              href="/dashboard/analytics"
              className="font-semibold text-neutral-muted hover:text-neutral-text"
            >
              View analytics →
            </Link>
          }
        />
        <StatCard
          label="QR Codes"
          value={qrCount}
          icon={<QrCode className="h-5 w-5" />}
          hint={
            <Link
              href="/dashboard/qr"
              className="font-semibold text-neutral-muted hover:text-neutral-text"
            >
              Manage QR →
            </Link>
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/links" className="group block">
          <Card hoverLift padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-button">
                <Link2 className="h-7 w-7" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-text mb-2">Manage Links</h3>
            <p className="text-sm text-neutral-muted leading-relaxed">
              View, edit, and manage all your shortened links. Track performance and optimize your campaigns.
            </p>
          </Card>
        </Link>

        <Link href="/dashboard/qr" className="group block">
          <Card hoverLift padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-text text-white flex items-center justify-center">
                <QrCode className="h-7 w-7" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-muted group-hover:text-neutral-text group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-text mb-2">QR Codes</h3>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Generate and manage QR codes for your links. Perfect for offline marketing and print materials.
            </p>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-surface flex items-center justify-center text-neutral-muted">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-text">Quick Start</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Link href="/dashboard/links/new">
            <Button variant="outline" className="w-full justify-start" pill={false}>
              Create Link →
            </Button>
          </Link>
          <Link href="/dashboard/qr/new">
            <Button variant="outline" className="w-full justify-start" pill={false}>
              Generate QR →
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" className="w-full justify-start" pill={false}>
              View Analytics →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
