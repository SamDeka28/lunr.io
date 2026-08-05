import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignCreatorService } from "@/lib/services/campaign-creator.service";
import { campaignsDisabledResponse } from "@/lib/features";

export async function GET(
  _request: NextRequest,
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

    const { id } = await params;
    const service = new CampaignCreatorService(supabase);
    const creators = await service.list(id, user.id);
    return NextResponse.json(creators);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list creators" },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;
    const body = await request.json();
    const service = new CampaignCreatorService(supabase);

    if (Array.isArray(body.creators)) {
      const result = await service.bulkCreate(id, user.id, body.creators);
      return NextResponse.json(result);
    }

    const creator = await service.create({
      campaign_id: id,
      user_id: user.id,
      display_name: body.display_name,
      handle: body.handle,
      platform: body.platform,
      profile_url: body.profile_url,
      status: body.status,
      fee_amount: body.fee_amount,
      fee_currency: body.fee_currency,
      deliverable_notes: body.deliverable_notes,
      due_at: body.due_at,
      utm_source: body.utm_source,
      utm_content: body.utm_content,
      destination_url: body.destination_url,
      generate_link: body.generate_link !== false,
    });

    return NextResponse.json(creator, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create creator" },
      { status: 400 }
    );
  }
}
