import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadGateClient } from "./lead-gate-client";
import { normalizeLeadCaptureConfig } from "@/lib/utils/lead-capture-config";

export default async function LeadCapturePage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select(
      "id, short_code, title, is_active, lead_capture_enabled, lead_capture_config"
    )
    .eq("short_code", shortCode)
    .eq("is_active", true)
    .maybeSingle();

  if (!link || !link.lead_capture_enabled) {
    redirect(`/${shortCode}`);
  }

  const config = normalizeLeadCaptureConfig(link.lead_capture_config);

  return (
    <LeadGateClient
      shortCode={shortCode}
      config={config}
      linkTitle={link.title}
    />
  );
}
