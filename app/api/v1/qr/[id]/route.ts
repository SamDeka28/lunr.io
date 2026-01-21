import { NextRequest, NextResponse } from "next/server";
import { withApiAuth, type AuthenticatedApiRequest } from "@/lib/middleware/api-auth";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/qr/[id] - Get a specific QR code
async function handleGet(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify ownership
    const { data: qrCode, error } = await serviceSupabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: qrCode.id,
      link_id: qrCode.link_id,
      qr_data: qrCode.qr_data,
      created_at: qrCode.created_at,
      is_active: qrCode.is_active,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch QR code" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/qr/[id] - Delete a QR code
async function handleDelete(
  request: AuthenticatedApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify ownership
    const { data: existingQR } = await serviceSupabase
      .from("qr_codes")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingQR) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    // Soft delete
    const { error } = await serviceSupabase
      .from("qr_codes")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "QR code deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete QR code" },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handleGet);
export const DELETE = withApiAuth(handleDelete);

