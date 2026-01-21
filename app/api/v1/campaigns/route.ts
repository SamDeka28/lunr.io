import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/campaigns - List all campaigns for the authenticated API user
async function handleGet(request: AuthenticatedApiRequest) {
  try {
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      count: campaigns?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/v1/campaigns - Create a new campaign
async function handlePost(request: AuthenticatedApiRequest) {
  try {
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;
    const body = await request.json();
    const {
      name,
      description,
      start_date,
      end_date,
      campaign_type,
      tags,
      target_clicks,
      budget,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const campaignService = new CampaignService(supabase);
    const campaign = await campaignService.createCampaign({
      name: name.trim(),
      description: description || null,
      start_date: start_date || null,
      end_date: end_date || null,
      campaign_type: campaign_type || null,
      tags: tags || null,
      target_clicks: target_clicks || 0,
      budget: budget || 0,
      user_id: userId,
    });

    return NextResponse.json(
      {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        campaign_type: campaign.campaign_type,
        tags: campaign.tags,
        target_clicks: campaign.target_clicks,
        budget: campaign.budget,
        is_active: campaign.is_active,
        created_at: campaign.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 400 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const POST = withApiAuth(handlePost);

