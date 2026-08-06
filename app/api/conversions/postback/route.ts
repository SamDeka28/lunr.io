import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  paramsFromBody,
  paramsFromSearchParams,
  recordPublicConversion,
} from "@/lib/services/conversion-track.handler";
import { rateLimit, RateLimitPresets, rateLimitHeaders } from "@/lib/utils/rate-limit";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * GET /api/conversions/postback — server-to-server conversion postback (query params).
 * POST with JSON body also supported.
 */
export async function GET(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const rl = await rateLimit(
      `conv-postback:${ip}`,
      RateLimitPresets.conversionTrack.limit,
      RateLimitPresets.conversionTrack.windowMs
    );
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const supabase = createServiceClient();
    const result = await recordPublicConversion(
      supabase,
      paramsFromSearchParams(request.nextUrl.searchParams)
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status, headers: rateLimitHeaders(rl) }
      );
    }

    return NextResponse.json(
      { ok: true, id: result.event.id },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to record conversion" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const rl = await rateLimit(
      `conv-postback:${ip}`,
      RateLimitPresets.conversionTrack.limit,
      RateLimitPresets.conversionTrack.windowMs
    );
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const supabase = createServiceClient();
    const result = await recordPublicConversion(
      supabase,
      paramsFromBody(body)
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status, headers: rateLimitHeaders(rl) }
      );
    }

    return NextResponse.json(
      { ok: true, id: result.event.id },
      { status: 201, headers: rateLimitHeaders(rl) }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to record conversion" },
      { status: 400 }
    );
  }
}
