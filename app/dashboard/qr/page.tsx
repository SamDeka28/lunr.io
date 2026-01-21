import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QRPageWrapper } from "./qr-page-wrapper";
import Link from "next/link";

export default async function QRCodePage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string; view?: string; status?: string; dateFilter?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const statusFilter = searchParams.status || "active";
  const dateFilter = searchParams.dateFilter;

  // Get user's QR codes
  let query = supabase
    .from("qr_codes")
    .select("*, links(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Apply status filter
  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "archived") {
    query = query.eq("is_active", false);
  }
  // "all" shows everything, no filter needed

  // Apply date filter
  if (dateFilter) {
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "last7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "thismonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastmonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
        break;
      default:
        startDate = null as any;
    }
    
    if (dateFilter !== "lastmonth" && startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
  }

  if (searchParams.search) {
    query = query.or(
      `links.short_code.ilike.%${searchParams.search}%,links.original_url.ilike.%${searchParams.search}%`
    );
  }

  const { data: qrCodes } = await query;

  // Check user limits using PlanService
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);
  
  const qrCount = qrCodes?.length || 0;
  const canCreateQR = limits.can_create_qr;

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text mb-2">Your QR Codes</h1>
            <p className="text-sm text-neutral-muted">
              {qrCount} / {limits.max_qr_codes === -1 ? "∞" : limits.max_qr_codes} QR codes used
            </p>
          </div>
          {canCreateQR && (
            <Link
              href="/dashboard/qr/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
            >
              <span className="text-lg">+</span>
              Generate QR Code
            </Link>
          )}
        </div>

        <QRPageWrapper
          qrCodes={qrCodes || []}
          canCreate={canCreateQR}
          initialSearch={searchParams.search}
          initialView={(searchParams.view as any) || "list"}
          initialStatus={(searchParams.status as any) || "active"}
          initialDateFilter={searchParams.dateFilter}
        />
      </div>
    </div>
  );
}

