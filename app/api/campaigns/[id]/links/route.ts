// API Route for Campaign Links
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignService } from "@/lib/services/campaign.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const links = await campaignService.getCampaignLinks(id, user.id);

    return NextResponse.json(links);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get campaign links" },
      { status: 500 }
    );
  }
}

