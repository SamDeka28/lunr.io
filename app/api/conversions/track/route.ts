import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ConversionService } from "@/lib/services/conversion.service";
import { createHmac, timingSafeEqual } from "crypto";

function verifyToken(
  token: string,
  payload: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Lightweight conversion track endpoint.
 * Body: { short_code | link_id, event_name?, value?, user_id, token }
 * token = HMAC-SHA256(user_id:short_code|link_id, CONVERSION_TRACK_SECRET or service role key slice)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id as string | undefined;
    const token = body.token as string | undefined;
    if (!userId || !token) {
      return NextResponse.json(
        { error: "user_id and token required" },
        { status: 400 }
      );
    }

    const secret =
      process.env.CONVERSION_TRACK_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "";
    if (!secret) {
      return NextResponse.json(
        { error: "Track endpoint not configured" },
        { status: 503 }
      );
    }

    const subject = body.short_code || body.link_id || "";
    const payload = `${userId}:${subject}`;
    if (!verifyToken(token, payload, secret)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const service = new ConversionService(supabase);
    const event = await service.record({
      user_id: userId,
      event_name: body.event_name,
      value: body.value,
      currency: body.currency,
      campaign_id: body.campaign_id,
      link_id: body.link_id,
      short_code: body.short_code,
      metadata: body.metadata,
      idempotency_key: body.idempotency_key,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to track conversion" },
      { status: 400 }
    );
  }
}
