import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, Link2, QrCode, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { QuickCreateCard } from "./quick-create-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's links count
  const { data: links } = await supabase
    .from("links")
    .select("id, click_count")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const linkCount = links?.length || 0;
  const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;

  // Get QR codes count
  const { data: qrCodes } = await supabase
    .from("qr_codes")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const qrCount = qrCodes?.length || 0;
  
  // Get plan limits
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);
  const remainingLinks = limits.remaining_links === -1 ? Infinity : limits.remaining_links;

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-text mb-3">Welcome back</h1>
        <p className="text-lg text-neutral-muted">
          Here's what's happening with your links today
        </p>
      </div>

      {/* Quick Create Card */}
      <div className="mb-8">
        <QuickCreateCard
          remainingLinks={remainingLinks}
          canCreateLink={limits.can_create_link}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border hover:shadow-hover transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-colors">
              <Link2 className="h-7 w-7 text-electric-sapphire" />
            </div>
          </div>
          <div className="text-4xl font-bold text-neutral-text mb-2">{linkCount}</div>
          <div className="text-sm font-medium text-neutral-muted">Total Links</div>
          <Link href="/dashboard/links" className="mt-3 text-xs text-electric-sapphire font-semibold inline-block hover:translate-x-1 transition-transform">
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border hover:shadow-hover transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center group-hover:from-blue-energy/20 group-hover:to-sky-aqua/20 transition-colors">
              <TrendingUp className="h-7 w-7 text-blue-energy" />
            </div>
          </div>
          <div className="text-4xl font-bold text-neutral-text mb-2">{totalClicks}</div>
          <div className="text-sm font-medium text-neutral-muted">Total Clicks</div>
          <Link href="/dashboard/analytics" className="mt-3 text-xs text-blue-energy font-semibold inline-block hover:translate-x-1 transition-transform">
            View analytics →
          </Link>
        </div>

        <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border hover:shadow-hover transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center group-hover:from-neon-pink/20 group-hover:to-raspberry-plum/20 transition-colors">
              <QrCode className="h-7 w-7 text-neon-pink" />
            </div>
          </div>
          <div className="text-4xl font-bold text-neutral-text mb-2">{qrCount}</div>
          <div className="text-sm font-medium text-neutral-muted">QR Codes</div>
          <Link href="/dashboard/qr" className="mt-3 text-xs text-neon-pink font-semibold inline-block hover:translate-x-1 transition-transform">
            Manage QR →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/links"
          className="bg-gradient-to-br from-white to-neutral-bg rounded-card p-8 shadow-soft border border-neutral-border hover:shadow-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-sapphire to-bright-indigo text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-button">
              <Link2 className="h-8 w-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-neutral-muted group-hover:text-electric-sapphire group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-text mb-2">Manage Links</h3>
          <p className="text-sm text-neutral-muted leading-relaxed">
            View, edit, and manage all your shortened links. Track performance and optimize your campaigns.
          </p>
        </Link>

        <Link
          href="/dashboard/qr"
          className="bg-gradient-to-br from-white to-neutral-bg rounded-card p-8 shadow-soft border border-neutral-border hover:shadow-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink to-raspberry-plum text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-button">
              <QrCode className="h-8 w-8" />
            </div>
            <ArrowRight className="w-6 h-6 text-neutral-muted group-hover:text-neon-pink group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-text mb-2">QR Codes</h3>
          <p className="text-sm text-neutral-muted leading-relaxed">
            Generate and manage QR codes for your links. Perfect for offline marketing and print materials.
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-blue-energy" />
          </div>
          <h3 className="text-xl font-bold text-neutral-text">Quick Start</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/links/new"
            className="p-4 rounded-xl bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10 hover:from-electric-sapphire/10 hover:to-bright-indigo/10 transition-all group"
          >
            <div className="text-sm font-semibold text-electric-sapphire mb-1 group-hover:translate-x-1 transition-transform inline-block">
              Create Link →
            </div>
            <div className="text-xs text-neutral-muted">Shorten a URL instantly</div>
          </Link>
          <Link
            href="/dashboard/qr/new"
            className="p-4 rounded-xl bg-gradient-to-br from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10 hover:from-neon-pink/10 hover:to-raspberry-plum/10 transition-all group"
          >
            <div className="text-sm font-semibold text-neon-pink mb-1 group-hover:translate-x-1 transition-transform inline-block">
              Generate QR →
            </div>
            <div className="text-xs text-neutral-muted">Create a QR code</div>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="p-4 rounded-xl bg-gradient-to-br from-blue-energy/5 to-sky-aqua/5 border border-blue-energy/10 hover:from-blue-energy/10 hover:to-sky-aqua/10 transition-all group"
          >
            <div className="text-sm font-semibold text-blue-energy mb-1 group-hover:translate-x-1 transition-transform inline-block">
              View Analytics →
            </div>
            <div className="text-xs text-neutral-muted">Track performance</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
