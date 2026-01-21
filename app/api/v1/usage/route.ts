import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { ApiUsageRepository } from "@/lib/db/repositories/api-usage.repository";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/usage - Get API usage statistics
async function handleGet(request: AuthenticatedApiRequest) {
  try {
    const supabase = await createClient();
    const userId = request.apiKey!.user_id;
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);
    const apiKeyId = searchParams.get("api_key_id");

    const usageRepo = new ApiUsageRepository(supabase);

    let stats;
    if (apiKeyId) {
      // Verify ownership of API key
      const { data: apiKey } = await supabase
        .from("api_keys")
        .select("id")
        .eq("id", apiKeyId)
        .eq("user_id", userId)
        .single();

      if (!apiKey) {
        return NextResponse.json(
          { error: "API key not found" },
          { status: 404 }
        );
      }

      stats = await usageRepo.getStats(apiKeyId, days);
    } else {
      // Get stats for all user's API keys
      stats = await usageRepo.getUserStats(userId, days);
    }

    return NextResponse.json({
      stats,
      period_days: days,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);

