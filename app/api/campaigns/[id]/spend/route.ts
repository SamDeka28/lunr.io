import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignSpendService } from "@/lib/services/campaign-spend.service";
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
    const service = new CampaignSpendService(supabase);
    const entries = await service.list(id, user.id);
    const total = entries.reduce((s, e) => s + Number(e.amount || 0), 0);
    return NextResponse.json({ entries, total });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list spend" },
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
    const service = new CampaignSpendService(supabase);
    const entry = await service.create(user.id, {
      campaign_id: id,
      amount: Number(body.amount),
      currency: body.currency,
      spent_on: body.spent_on,
      note: body.note,
      campaign_creator_id: body.campaign_creator_id,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add spend" },
      { status: 400 }
    );
  }
}
