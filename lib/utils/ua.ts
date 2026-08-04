import { UAParser } from "ua-parser-js";
import { isBotUserAgent } from "@/lib/utils/bot-detect";

export interface ParsedUserAgent {
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  isBot: boolean;
}

/**
 * Parse a User-Agent string into device/browser/OS fields for analytics storage.
 */
export function parseUserAgent(
  userAgent: string | null | undefined
): ParsedUserAgent {
  const isBot = isBotUserAgent(userAgent);

  if (!userAgent) {
    return {
      deviceType: null,
      browser: null,
      os: null,
      isBot,
    };
  }

  try {
    const result = UAParser(userAgent);

    // ua-parser-js leaves device.type undefined for typical desktop browsers
    const rawDevice = result.device?.type;
    const deviceType = rawDevice
      ? String(rawDevice)
      : result.os?.name
        ? "desktop"
        : null;

    const browser = result.browser?.name || null;
    const os = result.os?.name || null;

    // Some parsers mark browser.type as bot/crawler
    const typeIsBot =
      typeof result.browser?.type === "string" &&
      /bot|crawler|spider/i.test(result.browser.type);

    return {
      deviceType,
      browser,
      os,
      isBot: isBot || typeIsBot,
    };
  } catch {
    return {
      deviceType: null,
      browser: null,
      os: null,
      isBot,
    };
  }
}
