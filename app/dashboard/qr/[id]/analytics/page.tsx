import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QRAnalyticsClient } from "./analytics-client";

export default async function QRAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch QR code details
  const { data: qrCode, error: qrError } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (qrError || !qrCode) {
    redirect("/dashboard/qr");
  }

  // If QR code is linked to a link, fetch link analytics
  let linkStats = null;
  if (qrCode.link_id) {
    const statsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/links/${qrCode.link_id}/stats`,
      { cache: "no-store" }
    );
    linkStats = statsResponse.ok ? await statsResponse.json() : null;
  }

  return <QRAnalyticsClient qrCode={qrCode} linkStats={linkStats} />;
}

