import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { ConversionService } from "@/lib/services/conversion.service";

async function handlePost(request: AuthenticatedApiRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const service = new ConversionService(supabase);
    const event = await service.record({
      user_id: request.apiKey!.user_id,
      event_name: body.event_name,
      value: body.value,
      currency: body.currency,
      campaign_id: body.campaign_id,
      link_id: body.link_id,
      short_code: body.short_code,
      metadata: body.metadata,
      occurred_at: body.occurred_at,
      idempotency_key: body.idempotency_key,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record conversion" },
      { status: 400 }
    );
  }
}

export const POST = withApiAuth(handlePost);
