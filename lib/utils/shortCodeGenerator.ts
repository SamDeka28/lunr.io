// Short Code Generator Module
import { randomBytes } from "crypto";
import { config } from "@/config";

const RESERVED_SLUGS = new Set([
  "api",
  "auth",
  "dashboard",
  "docs",
  "login",
  "signup",
  "pricing",
  "privacy",
  "terms",
  "admin",
  "settings",
  "billing",
  "help",
  "support",
  "www",
  "app",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "p",
  "qr",
  "campaigns",
  "campaign",
  "links",
  "pages",
  "analytics",
  "webhooks",
  "null",
  "undefined",
]);

// Lightweight blocklist — extend as needed
const PROFANITY = new Set([
  "fuck",
  "shit",
  "ass",
  "dick",
  "porn",
  "xxx",
  "rape",
  "nazi",
]);

/**
 * Generates a cryptographically random short code (lowercase).
 */
export function generateShortCode(length: number = config.shortCode.length): string {
  const charset = (config.shortCode.charset || "abcdefghijklmnopqrstuvwxyz0123456789").toLowerCase();
  const bytes = randomBytes(length);
  let shortCode = "";

  for (let i = 0; i < length; i++) {
    shortCode += charset[bytes[i] % charset.length];
  }

  return shortCode;
}

/**
 * Normalize user-provided short codes to lowercase.
 */
export function normalizeShortCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Validates a short code format
 * Allows: alphanumeric characters, underscores, and hyphens
 * Length: 2-20 characters
 * Normalized to lowercase for uniqueness.
 */
export function isValidShortCode(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false;
  }

  const normalized = normalizeShortCode(code);

  // Allow alphanumeric, underscores, and hyphens
  // Must start and end with alphanumeric (no leading/trailing special chars)
  const regex = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/;

  return regex.test(normalized) && normalized.length >= 2 && normalized.length <= 20;
}

/**
 * Returns an error message if the short code is reserved or inappropriate.
 */
export function getShortCodeContentError(code: string): string | null {
  const normalized = normalizeShortCode(code);
  if (RESERVED_SLUGS.has(normalized)) {
    return `"${normalized}" is a reserved word and cannot be used as a short code`;
  }
  if (PROFANITY.has(normalized) || [...PROFANITY].some((w) => normalized.includes(w))) {
    return "This short code is not allowed";
  }
  return null;
}
