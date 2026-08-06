import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ConversionService } from "@/lib/services/conversion.service";
import { campaignsDisabledResponse } from "@/lib/features";

/**
 * POST /api/campaigns/[id]/conversions
 * Session-authenticated conversion logging for Campaign Studio.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const disabled = campaignsDisabledResponse();
  if (disabled) return disabled;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();
    const service = new ConversionService(supabase);
    const event = await service.record({
      user_id: user.id,
      event_name: body.event_name || "conversion",
      value: body.value,
      currency: body.currency,
      campaign_id: campaignId,
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
