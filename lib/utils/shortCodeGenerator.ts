// Short Code Generator Module
import { config } from "@/config";

/**
 * Generates a random short code
 */
export function generateShortCode(length: number = config.shortCode.length): string {
  const charset = config.shortCode.charset;
  let shortCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    shortCode += charset[randomIndex];
  }

  return shortCode;
}

/**
 * Validates a short code format
 * Allows: alphanumeric characters, underscores, and hyphens
 * Length: 2-20 characters
 */
export function isValidShortCode(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Allow alphanumeric, underscores, and hyphens
  // Must start and end with alphanumeric (no leading/trailing special chars)
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

  return regex.test(code) && code.length >= 2 && code.length <= 20;
}

