import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OverviewAnalyticsService } from "@/lib/services/overview-analytics.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = new OverviewAnalyticsService(supabase);
    const settings = await service.getAlertSettings(user.id);
    return NextResponse.json(settings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const enabled = typeof body.enabled === "boolean" ? body.enabled : undefined;
    let spike_multiplier =
      typeof body.spike_multiplier === "number" ? body.spike_multiplier : undefined;

    if (spike_multiplier != null) {
      spike_multiplier = Math.min(10, Math.max(1.2, spike_multiplier));
    }

    const service = new OverviewAnalyticsService(supabase);
    const settings = await service.updateAlertSettings(user.id, {
      enabled,
      spike_multiplier,
    });

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update alerts. Apply the analytics migration if this table is missing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
