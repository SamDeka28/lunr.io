import { createHmac, timingSafeEqual } from "crypto";
import { config } from "@/config";
import {
  LUNR_SC_PARAM,
  buildInstallSnippets,
} from "@/lib/utils/conversion-snippets";

export {
  LUNR_SC_PARAM,
  LUNR_SC_STORAGE_KEY,
  appendLunrScParam,
  buildInstallSnippets,
} from "@/lib/utils/conversion-snippets";

const TRANSPARENT_GIF_BASE64 =
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const TRANSPARENT_GIF = Buffer.from(TRANSPARENT_GIF_BASE64, "base64");

export function getConversionTrackSecret(): string | null {
  const secret =
    process.env.CONVERSION_TRACK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";
  return secret || null;
}

export function campaignTokenSubject(campaignId: string): string {
  return `campaign:${campaignId}`;
}

export function signConversionToken(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyConversionToken(
  token: string,
  payload: string,
  secret: string
): boolean {
  const expected = signConversionToken(payload, secret);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Token payload is `userId:subject` where subject is short_code, link_id, or campaign:{id}. */
export function conversionTokenPayload(userId: string, subject: string): string {
  return `${userId}:${subject}`;
}

export function verifyAnyConversionSubject(
  token: string,
  userId: string,
  subjects: string[],
  secret: string
): boolean {
  return subjects.some((subject) =>
    verifyConversionToken(
      token,
      conversionTokenPayload(userId, subject),
      secret
    )
  );
}

export type ConversionTrackParams = {
  userId: string;
  token: string;
  campaignId?: string | null;
  linkId?: string | null;
  shortCode?: string | null;
  eventName?: string | null;
  value?: number | null;
  currency?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function parseTrackQuery(
  searchParams: URLSearchParams
): Omit<ConversionTrackParams, "metadata"> & {
  metadata?: Record<string, unknown> | null;
} {
  const valueRaw = searchParams.get("v") ?? searchParams.get("value");
  const value =
    valueRaw != null && valueRaw !== "" && !Number.isNaN(Number(valueRaw))
      ? Number(valueRaw)
      : null;

  return {
    userId: searchParams.get("uid") || searchParams.get("user_id") || "",
    token: searchParams.get("t") || searchParams.get("token") || "",
    campaignId:
      searchParams.get("campaign_id") || searchParams.get("cid") || null,
    linkId: searchParams.get("link_id") || searchParams.get("lid") || null,
    shortCode:
      searchParams.get("sc") ||
      searchParams.get("short_code") ||
      searchParams.get(LUNR_SC_PARAM) ||
      null,
    eventName:
      searchParams.get("e") ||
      searchParams.get("event") ||
      searchParams.get("event_name") ||
      "conversion",
    value,
    currency: searchParams.get("cur") || searchParams.get("currency") || null,
    idempotencyKey:
      searchParams.get("idk") ||
      searchParams.get("idempotency_key") ||
      searchParams.get("order_id") ||
      null,
  };
}

export function buildTrackSubjects(input: {
  shortCode?: string | null;
  linkId?: string | null;
  campaignId?: string | null;
}): string[] {
  const subjects: string[] = [];
  if (input.shortCode) subjects.push(input.shortCode);
  if (input.linkId) subjects.push(input.linkId);
  if (input.campaignId) subjects.push(campaignTokenSubject(input.campaignId));
  return subjects;
}

export function getPublicBaseUrl(): string {
  return config.app.baseUrl.replace(/\/$/, "");
}

export type CampaignTrackingSnippets = {
  configured: boolean;
  user_id: string;
  campaign_id: string;
  token: string | null;
  base_url: string;
  pixel_url: string | null;
  postback_url: string | null;
  pixel_img: string | null;
  capture_snippet: string;
  thank_you_snippet: string | null;
  postback_example: string | null;
};

export function buildCampaignTrackingSnippets(input: {
  userId: string;
  campaignId: string;
  eventName?: string;
  currency?: string;
}): CampaignTrackingSnippets {
  const secret = getConversionTrackSecret();
  const base = getPublicBaseUrl();
  const eventName = input.eventName || "purchase";

  if (!secret) {
    const empty = buildInstallSnippets({
      baseUrl: base,
      userId: input.userId,
      campaignId: input.campaignId,
      token: "pending",
      eventName,
      currency: input.currency,
    });
    return {
      configured: false,
      user_id: input.userId,
      campaign_id: input.campaignId,
      token: null,
      base_url: base,
      pixel_url: null,
      postback_url: null,
      pixel_img: null,
      capture_snippet: empty.capture_snippet,
      thank_you_snippet: null,
      postback_example: null,
    };
  }

  const subject = campaignTokenSubject(input.campaignId);
  const token = signConversionToken(
    conversionTokenPayload(input.userId, subject),
    secret
  );

  const install = buildInstallSnippets({
    baseUrl: base,
    userId: input.userId,
    campaignId: input.campaignId,
    token,
    eventName,
    currency: input.currency,
  });

  return {
    configured: true,
    user_id: input.userId,
    campaign_id: input.campaignId,
    token,
    base_url: base,
    ...install,
  };
}
