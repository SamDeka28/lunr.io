import { NextResponse } from "next/server";

/**
 * Product feature flags (env-driven).
 * Campaigns default OFF until ready to launch.
 *
 * Enable with: NEXT_PUBLIC_FEATURE_CAMPAIGNS=true
 */
export function isCampaignsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_CAMPAIGNS === "true";
}

/** Return a 404 response when campaigns are flagged off; otherwise null. */
export function campaignsDisabledResponse() {
  if (!isCampaignsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}
