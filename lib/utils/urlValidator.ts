// URL Validation Module — includes SSRF / private-IP / loop / length checks

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

const MAX_URL_LENGTH = 2048;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
]);

function isPrivateOrReservedIp(hostname: string): boolean {
  // IPv4
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((p) => p > 255)) return true;
    const [a, b] = parts;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  // IPv6 condensed forms commonly used for loopback / link-local / ULA
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "::1" || host === "::") return true;
  if (host.startsWith("fc") || host.startsWith("fd")) return true; // ULA
  if (host.startsWith("fe80")) return true; // link-local
  if (host.startsWith("ff")) return true; // multicast

  return false;
}

function isSelfShortLink(urlObj: URL): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return false;
  try {
    const app = new URL(appUrl.includes("://") ? appUrl : `https://${appUrl}`);
    if (urlObj.hostname.toLowerCase() !== app.hostname.toLowerCase()) {
      return false;
    }
    // Path looks like a short code (no nested dashboard/api paths)
    const path = urlObj.pathname.replace(/^\//, "");
    if (!path || path.includes("/")) return false;
    const reserved = new Set([
      "dashboard",
      "api",
      "login",
      "signup",
      "docs",
      "auth",
      "p",
      "pricing",
      "api-reference",
    ]);
    return !reserved.has(path.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes a URL
 */
export function validateURL(url: string): ValidationResult {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "URL is required",
    };
  }

  let normalizedUrl = url.trim();

  if (normalizedUrl.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: `URL must be ${MAX_URL_LENGTH} characters or fewer`,
    };
  }

  // Add protocol if missing
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const urlObj = new URL(normalizedUrl);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: "Only HTTP and HTTPS URLs are allowed",
      };
    }

    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        error: "Invalid hostname",
      };
    }

    const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");

    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
      return {
        isValid: false,
        error: "Localhost and metadata hostnames are not allowed",
      };
    }

    if (isPrivateOrReservedIp(hostname)) {
      return {
        isValid: false,
        error: "Private or reserved IP addresses are not allowed",
      };
    }

    // Block obvious self-shortening loops (short → short)
    if (isSelfShortLink(urlObj)) {
      return {
        isValid: false,
        error: "Cannot create a short link that points to another short link on this domain",
      };
    }

    return {
      isValid: true,
      normalizedUrl: normalizedUrl,
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid URL format",
    };
  }
}

/**
 * Optional Google Safe Browsing lookup. No-ops (allows) if API key is unset.
 * Call after validateURL when creating links.
 */
export async function checkUrlSafety(url: string): Promise<{
  safe: boolean;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return { safe: true };
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "lunr", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Safe Browsing API error:", response.status);
      // Fail open on API errors so link creation isn't blocked by outages
      return { safe: true };
    }

    const data = await response.json();
    if (data.matches && data.matches.length > 0) {
      return {
        safe: false,
        error: "This URL has been flagged as unsafe and cannot be shortened",
      };
    }

    return { safe: true };
  } catch (error) {
    console.error("Safe Browsing lookup failed:", error);
    return { safe: true };
  }
}

/**
 * Normalizes a URL (adds protocol if missing)
 */
export function normalizeURL(url: string): string {
  if (!url || typeof url !== "string") {
    return url;
  }

  let normalized = url.trim();

  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  return normalized;
}
