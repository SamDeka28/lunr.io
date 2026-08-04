import { createHmac } from "crypto";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt$";
const KEYLEN = 64;

/**
 * Hash a password with scrypt + random salt.
 * Format: scrypt$<saltHex>$<hashHex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `${SCRYPT_PREFIX}${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Verify a password against a stored hash.
 * Supports current scrypt format and legacy unsalted SHA-256 hex hashes.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (storedHash.startsWith(SCRYPT_PREFIX)) {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const actual = scryptSync(password, salt, KEYLEN);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  // Legacy SHA-256 (unsalted) — verify for existing rows until rehashed
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const legacyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  if (legacyHash.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(legacyHash, "utf8"),
      Buffer.from(storedHash, "utf8")
    );
  } catch {
    return legacyHash === storedHash;
  }
}

export function getAccessCookieName(shortCode: string) {
  return `link_access_${shortCode}`;
}

export function signLinkAccess(linkId: string, passwordHash: string): string {
  const secret =
    process.env.LINK_PASSWORD_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "lunr-link-password";
  return createHmac("sha256", secret)
    .update(`${linkId}:${passwordHash}`)
    .digest("hex");
}

export function verifyLinkAccessCookie(
  cookieValue: string | undefined,
  linkId: string,
  passwordHash: string
): boolean {
  if (!cookieValue) return false;
  return cookieValue === signLinkAccess(linkId, passwordHash);
}
