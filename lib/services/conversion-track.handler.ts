import type { SupabaseClient } from "@supabase/supabase-js";
import { ConversionService } from "@/lib/services/conversion.service";
import {
  buildTrackSubjects,
  getConversionTrackSecret,
  parseTrackQuery,
  verifyAnyConversionSubject,
  type ConversionTrackParams,
} from "@/lib/utils/conversion-track";

export type TrackResult =
  | { ok: true; event: Awaited<ReturnType<ConversionService["record"]>> }
  | { ok: false; status: number; error: string };

export function paramsFromBody(body: Record<string, unknown>): ConversionTrackParams {
  const valueRaw = body.value ?? body.v;
  const value =
    valueRaw != null && valueRaw !== "" && !Number.isNaN(Number(valueRaw))
      ? Number(valueRaw)
      : null;

  return {
    userId: String(body.user_id || body.uid || ""),
    token: String(body.token || body.t || ""),
    campaignId: (body.campaign_id || body.cid || null) as string | null,
    linkId: (body.link_id || body.lid || null) as string | null,
    shortCode: (body.short_code || body.sc || null) as string | null,
    eventName: (body.event_name || body.event || body.e || "conversion") as
      | string
      | null,
    value,
    currency: (body.currency || body.cur || null) as string | null,
    idempotencyKey: (body.idempotency_key ||
      body.idk ||
      body.order_id ||
      null) as string | null,
    metadata: (body.metadata as Record<string, unknown> | null) || null,
  };
}

export function paramsFromSearchParams(
  searchParams: URLSearchParams
): ConversionTrackParams {
  return parseTrackQuery(searchParams);
}

export async function recordPublicConversion(
  supabase: SupabaseClient,
  params: ConversionTrackParams
): Promise<TrackResult> {
  if (!params.userId || !params.token) {
    return { ok: false, status: 400, error: "uid and token required" };
  }

  const secret = getConversionTrackSecret();
  if (!secret) {
    return { ok: false, status: 503, error: "Track endpoint not configured" };
  }

  const subjects = buildTrackSubjects({
    shortCode: params.shortCode,
    linkId: params.linkId,
    campaignId: params.campaignId,
  });

  if (subjects.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "campaign_id, link_id, or short_code required",
    };
  }

  if (
    !verifyAnyConversionSubject(
      params.token,
      params.userId,
      subjects,
      secret
    )
  ) {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  try {
    const service = new ConversionService(supabase);
    const event = await service.record({
      user_id: params.userId,
      event_name: params.eventName || "conversion",
      value: params.value,
      currency: params.currency,
      campaign_id: params.campaignId,
      link_id: params.linkId,
      short_code: params.shortCode,
      metadata: {
        ...(params.metadata || {}),
        source: "public_track",
      },
      idempotency_key: params.idempotencyKey,
    });
    return { ok: true, event };
  } catch (error: any) {
    return {
      ok: false,
      status: 400,
      error: error?.message || "Failed to track conversion",
    };
  }
}
