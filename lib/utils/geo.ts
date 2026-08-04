import type { NextRequest } from "next/server";

/**
 * Extract ISO 3166-1 alpha-2 country code from a Next.js request.
 * Prefers Vercel `request.geo`, then platform headers.
 */
export function getCountryFromRequest(request: NextRequest): string | null {
  // Vercel Edge / Node runtime geo (when available)
  const geoCountry = (request as NextRequest & { geo?: { country?: string } })
    .geo?.country;
  if (geoCountry && /^[A-Za-z]{2}$/.test(geoCountry)) {
    return geoCountry.toUpperCase();
  }

  const headerCandidates = [
    request.headers.get("x-vercel-ip-country"),
    request.headers.get("cf-ipcountry"),
    request.headers.get("x-country-code"),
  ];

  for (const value of headerCandidates) {
    if (!value) continue;
    const trimmed = value.trim();
    // Cloudflare uses "XX" / "T1" for unknown / tor
    if (/^[A-Za-z]{2}$/.test(trimmed) && trimmed.toUpperCase() !== "XX") {
      return trimmed.toUpperCase();
    }
  }

  return null;
}
