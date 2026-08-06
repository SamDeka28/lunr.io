import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { campaignsDisabledResponse } from "@/lib/features";
import { buildCampaignTrackingSnippets } from "@/lib/utils/conversion-track";

/**
 * GET /api/campaigns/[id]/tracking
 * Returns copy-paste pixel, capture, and postback snippets for this campaign.
 */
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

    const snippets = buildCampaignTrackingSnippets({
      userId: user.id,
      campaignId,
      eventName: "purchase",
    });

    return NextResponse.json(snippets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load tracking snippets" },
      { status: 500 }
    );
  }
}
