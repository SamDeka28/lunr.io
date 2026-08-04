import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  block_id: z.string().optional().nullable(),
});

// POST /api/pages/[id]/email-capture
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, is_active, is_public")
      .eq("id", id)
      .single();

    if (pageError || !page || !page.is_active || !page.is_public) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const { error } = await supabase.from("page_email_captures").insert({
      page_id: id,
      email: parsed.data.email.toLowerCase().trim(),
      block_id: parsed.data.block_id || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, duplicate: true });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email capture error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture email" },
      { status: 500 }
    );
  }
}
