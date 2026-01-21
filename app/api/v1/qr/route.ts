import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { PlanService } from "@/lib/services/plan.service";
import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

// GET /api/v1/qr - List all QR codes for the authenticated API user
async function handleGet(request: AuthenticatedApiRequest) {
  try {
    // Use service role client to bypass RLS for API key authentication
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const userId = request.apiKey!.user_id;

    const { data: qrCodes, error } = await serviceSupabase
      .from("qr_codes")
      .select("id, link_id, qr_data, created_at, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching QR codes:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch QR codes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      qr_codes: qrCodes || [],
      count: qrCodes?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/qr:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

// POST /api/v1/qr - Create a new QR code
async function handlePost(request: AuthenticatedApiRequest) {
  try {
    // Use service role client to bypass RLS for API key authentication
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const userId = request.apiKey!.user_id;
    const body = await request.json();
    const { link_id, url } = body;

    if (!link_id && !url) {
      return NextResponse.json(
        { error: "link_id or url is required" },
        { status: 400 }
      );
    }

    // Check user limits
    const planService = new PlanService(serviceSupabase);
    if (!(await planService.canCreateQR(userId))) {
      const limits = await planService.getUsageLimits(userId);
      return NextResponse.json(
        { error: `You've reached your limit of ${limits.max_qr_codes} QR codes. Upgrade to create more.` },
        { status: 403 }
      );
    }

    // Generate QR code
    let qrUrl = url;
    if (link_id) {
      // Verify ownership of link
      const { data: link } = await serviceSupabase
        .from("links")
        .select("original_url")
        .eq("id", link_id)
        .eq("user_id", userId)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Link not found" },
          { status: 404 }
        );
      }

      qrUrl = link.original_url;
    }

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
    });

    // Save QR code
    const { data: qrCode, error: insertError } = await serviceSupabase
      .from("qr_codes")
      .insert({
        user_id: userId,
        link_id: link_id || null,
        qr_data: qrDataUrl,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to create QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: qrCode.id,
        link_id: qrCode.link_id,
        qr_data: qrCode.qr_data,
        created_at: qrCode.created_at,
        is_active: qrCode.is_active,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create QR code" },
      { status: 400 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const POST = withApiAuth(handlePost);

