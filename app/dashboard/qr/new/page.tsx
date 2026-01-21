import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QRCodeForm from "./qr-form";

export default async function NewQRCodePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user limits using PlanService
  const { PlanService } = await import("@/lib/services/plan.service");
  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  if (!limits.can_create_qr) {
    redirect("/dashboard/qr");
  }

  // Get user's links
  const { data: links } = await supabase
    .from("links")
    .select("id, short_code, original_url, title")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <QRCodeForm userId={user.id} links={links || []} />;
}

