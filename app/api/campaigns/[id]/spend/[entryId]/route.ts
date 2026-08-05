import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CampaignSpendService } from "@/lib/services/campaign-spend.service";
import { campaignsDisabledResponse } from "@/lib/features";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
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

    const { entryId } = await params;
    const service = new CampaignSpendService(supabase);
    await service.delete(entryId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete spend" },
      { status: 400 }
    );
  }
}
