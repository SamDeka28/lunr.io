import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/campaigns/[id] - Get a specific campaign
async function handleGet(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    const campaignService = new CampaignService(supabase);
    const campaign = await campaignService.getCampaignWithStats(id, userId);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/campaigns/[id] - Update a campaign
async function handlePatch(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;
    const body = await request.json();

    // Verify ownership
    const { data: existingCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Update allowed fields
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.campaign_type !== undefined) updates.campaign_type = body.campaign_type;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.target_clicks !== undefined) updates.target_clicks = body.target_clicks;
    if (body.budget !== undefined) updates.budget = body.budget;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update campaign" },
        { status: 400 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/campaigns/[id] - Delete a campaign
async function handleDelete(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    // Verify ownership
    const { data: existingCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const PATCH = withApiAuth(handlePatch);
export const DELETE = withApiAuth(handleDelete);

