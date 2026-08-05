import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { TrendingUp, Link2, QrCode, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { QuickCreateCard } from "./quick-create-card";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";

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

  const shortcuts = [
    {
      href: "/dashboard/links",
      title: "Links",
      description: "Manage short links and destinations",
      icon: Link2,
    },
    {
      href: "/dashboard/qr",
      title: "QR codes",
      description: "Generate and download QR codes",
      icon: QrCode,
    },
    {
      href: "/dashboard/pages",
      title: "Pages",
      description: "Build branded link-in-bio pages",
      icon: FileText,
    },
    {
      href: "/dashboard/analytics",
      title: "Analytics",
      description: "Clicks, referrers, and performance",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardContainer>
      <PageHeader
        title="Home"
        description="Create links, track clicks, and manage your campaigns."
      />

      <div className="mb-8">
        <QuickCreateCard
          remainingLinks={remainingLinks}
          canCreateLink={limits.can_create_link}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total links"
          value={linkCount.toLocaleString()}
          icon={<Link2 className="h-4 w-4" />}
          accent="primary"
          hint={
            <Link href="/dashboard/links" className="text-primary font-medium hover:underline">
              View all
            </Link>
          }
        />
        <StatCard
          label="Total clicks"
          value={totalClicks.toLocaleString()}
          icon={<TrendingUp className="h-4 w-4" />}
          hint={
            <Link
              href="/dashboard/analytics"
              className="font-medium text-neutral-muted hover:text-neutral-text transition-colors"
            >
              Open analytics
            </Link>
          }
        />
        <StatCard
          label="QR codes"
          value={qrCount.toLocaleString()}
          icon={<QrCode className="h-4 w-4" />}
          hint={
            <Link
              href="/dashboard/qr"
              className="font-medium text-neutral-muted hover:text-neutral-text transition-colors"
            >
              Manage
            </Link>
          }
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-muted uppercase tracking-wide mb-3 px-0.5">
          Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card
                  hoverLift
                  className="h-full flex items-center gap-4 !p-4 sm:!p-5"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-neutral-text tracking-tight">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-muted mt-0.5 leading-relaxed truncate">
                      {item.description}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-border group-hover:text-primary transition-colors shrink-0" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardContainer>
  );
}
