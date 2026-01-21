// API Route to get user profile with plan and usage
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PlanService } from "@/lib/services/plan.service";

export async function GET() {
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

    const planService = new PlanService(supabase);
    const profile = await planService.getUserPlan(user.id);
    const usage = await planService.getUsageLimits(user.id);

    return NextResponse.json({
      profile,
      usage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get profile" },
      { status: 500 }
    );
  }
}

