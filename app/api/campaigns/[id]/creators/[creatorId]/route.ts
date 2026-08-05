import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignCreatorService } from "@/lib/services/campaign-creator.service";
import { campaignsDisabledResponse } from "@/lib/features";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
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

    const { creatorId } = await params;
    const body = await request.json();
    const service = new CampaignCreatorService(supabase);
    const creator = await service.update(creatorId, user.id, {
      ...body,
      create_spend_on_paid: body.create_spend_on_paid !== false,
    });
    return NextResponse.json(creator);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update creator" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; creatorId: string }> }
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

    const { creatorId } = await params;
    const service = new CampaignCreatorService(supabase);
    await service.delete(creatorId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete creator" },
      { status: 400 }
    );
  }
}
