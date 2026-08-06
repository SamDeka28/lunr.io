import { createHmac } from "crypto";

export function getLeadAccessCookieName(shortCode: string) {
  return `link_lead_${shortCode}`;
}

function leadSecret() {
  return (
    process.env.LINK_LEAD_SECRET ||
    process.env.LINK_PASSWORD_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "lunr-link-lead"
  );
}

export function signLeadAccess(linkId: string): string {
  return createHmac("sha256", leadSecret())
    .update(`lead:${linkId}`)
    .digest("hex");
}

export function verifyLeadAccessCookie(
  cookieValue: string | undefined,
  linkId: string
): boolean {
  if (!cookieValue) return false;
  return cookieValue === signLeadAccess(linkId);
}
