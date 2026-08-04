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

    // Campaigns are a paid feature (pro+)
    const { PlanService } = await import("@/lib/services/plan.service");
    const planService = new PlanService(supabase);
    const profile = await planService.getUserPlan(user.id);
    const planName = profile?.plan?.name || "free";
    if (planName === "free") {
      return NextResponse.json(
        { error: "Campaigns are available on Pro and higher plans. Upgrade to create campaigns." },
        { status: 403 }
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
      budget,
      utm_defaults,
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
      utm_defaults: utm_defaults || null,
      user_id: user.id,
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      utm_defaults: campaign.utm_defaults,
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

