import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getOwnedQr(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  userId: string
) {
  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id, user_id, qr_data, title, description, link_id")
    .eq("id", id)
    .single();

  if (!qrCode) {
    return { error: NextResponse.json({ error: "QR code not found" }, { status: 404 }) };
  }
  if (qrCode.user_id !== userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { qrCode };
}

export async function PATCH(
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
    const owned = await getOwnedQr(supabase, id, user.id);
    if (owned.error) return owned.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (
      typeof body.qr_data === "string" &&
      body.qr_data.startsWith("data:image")
    ) {
      updates.qr_data = body.qr_data;
    }
    if (typeof body.title === "string") {
      updates.title = body.title.trim() ? body.title.trim().slice(0, 255) : null;
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim()
        ? body.description.trim().slice(0, 2000)
        : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("qr_codes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update QR code" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const owned = await getOwnedQr(supabase, id, user.id);
    if (owned.error) return owned.error;

    // Soft delete
    const { error } = await supabase
      .from("qr_codes")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
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

