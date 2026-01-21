// URL Validation Module

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
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

  // Trim whitespace
  let normalizedUrl = url.trim();

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

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        error: "Invalid hostname",
      };
    }

    // Basic security checks
    if (urlObj.hostname.includes("localhost") && process.env.NODE_ENV === "production") {
      return {
        isValid: false,
        error: "Localhost URLs are not allowed in production",
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

