import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  paramsFromSearchParams,
  recordPublicConversion,
} from "@/lib/services/conversion-track.handler";
import { TRANSPARENT_GIF } from "@/lib/utils/conversion-track";
import { rateLimit, RateLimitPresets, rateLimitHeaders } from "@/lib/utils/rate-limit";

/**
 * GET /api/conversions/pixel
 * 1×1 GIF conversion pixel for thank-you pages.
 * Always returns a GIF (even on error) so page layout is never broken.
 */
export async function GET(request: NextRequest) {
  const gifHeaders: HeadersInit = {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rl = await rateLimit(
      `conv-pixel:${ip}`,
      RateLimitPresets.conversionTrack.limit,
      RateLimitPresets.conversionTrack.windowMs
    );

    Object.assign(gifHeaders, rateLimitHeaders(rl));

    if (rl.success) {
      const supabase = createServiceClient();
      const result = await recordPublicConversion(
        supabase,
        paramsFromSearchParams(request.nextUrl.searchParams)
      );
      if (!result.ok) {
        // Still return GIF; include soft signal for debugging
        gifHeaders["X-Lunr-Track"] = result.error.slice(0, 80);
      } else {
        gifHeaders["X-Lunr-Track"] = "ok";
      }
    } else {
      gifHeaders["X-Lunr-Track"] = "rate_limited";
    }
  } catch (error: any) {
    console.error("Conversion pixel error:", error?.message || error);
    gifHeaders["X-Lunr-Track"] = "error";
  }

  return new NextResponse(new Uint8Array(TRANSPARENT_GIF), {
    status: 200,
    headers: gifHeaders,
  });
}
