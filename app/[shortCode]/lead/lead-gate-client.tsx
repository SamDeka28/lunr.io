"use client";

import { useRouter } from "next/navigation";
import { LeadGateForm } from "@/components/lead-capture/lead-gate-form";
import type { LeadCaptureConfig } from "@/lib/utils/lead-capture-config";

export function LeadGateClient({
  shortCode,
  config,
  linkTitle,
}: {
  shortCode: string;
  config: LeadCaptureConfig;
  linkTitle?: string | null;
}) {
  const router = useRouter();

  return (
    <LeadGateForm
      shortCode={shortCode}
      config={config}
      linkTitle={linkTitle}
      mode="live"
      onSuccess={() => router.replace(`/${shortCode}`)}
    />
  );
}
