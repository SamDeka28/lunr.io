// API Route for Individual Campaign Operations
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { campaignsDisabledResponse } from "@/lib/features";

export async function GET(
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignService = new CampaignService(supabase);
    const campaign = await campaignService.getCampaignWithStats(id, user.id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
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
      default_destination_url,
      currency,
      is_active,
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const campaignService = new CampaignService(supabase);
    const { campaign, utmLinksUpdated } = await campaignService.updateCampaign(id, user.id, {
      name,
      description,
      start_date,
      end_date,
      campaign_type,
      tags,
      target_clicks,
      budget,
      currency: body.currency,
      utm_defaults,
      default_destination_url: body.default_destination_url,
      ...(typeof is_active === "boolean" ? { is_active } : {}),
    });

    return NextResponse.json({ ...campaign, utm_links_updated: utmLinksUpdated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update campaign" },
      { status: 400 }
    );
  }
}

export async function DELETE(
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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignService = new CampaignService(supabase);
    await campaignService.deleteCampaign(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete campaign" },
      { status: 400 }
    );
  }
}

