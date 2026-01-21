// API Route for Campaign Management
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignService } from "@/lib/services/campaign.service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      start_date, 
      end_date,
      campaign_type,
      tags,
      target_clicks,
      budget
    } = body;

    if (!name || name.trim().length === 0) {
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
      user_id: user.id,
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      is_active: campaign.is_active,
      created_at: campaign.created_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const campaignService = new CampaignService(supabase);
    const campaigns = await campaignService.getUserCampaigns(user.id);

    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get campaigns" },
      { status: 500 }
    );
  }
}

