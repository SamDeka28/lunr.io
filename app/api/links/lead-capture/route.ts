import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  getLeadAccessCookieName,
  signLeadAccess,
} from "@/lib/utils/lead-capture";
import {
  normalizeLeadCaptureConfig,
  validateLeadResponses,
} from "@/lib/utils/lead-capture-config";

const schema = z.object({
  short_code: z.string().min(1),
  responses: z.record(z.union([z.string(), z.boolean()])).optional(),
  // Legacy flat payload support
  email: z.string().email().optional(),
  name: z.string().max(200).optional().nullable(),
});

/**
 * POST /api/links/lead-capture
 * Body: { short_code, responses } or legacy { short_code, email, name? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { short_code } = parsed.data;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { rateLimit, RateLimitPresets } = await import(
      "@/lib/utils/rate-limit"
    );
    const rl = await rateLimit(
      `lead:${ip}:${short_code}`,
      RateLimitPresets.leadCapture.limit,
      RateLimitPresets.leadCapture.windowMs
    );
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, short_code, is_active, lead_capture_enabled, lead_capture_config")
      .eq("short_code", short_code)
      .eq("is_active", true)
      .maybeSingle();

    if (linkError || !link || !link.lead_capture_enabled) {
      return NextResponse.json(
        { error: "Link not found or lead capture is not enabled" },
        { status: 404 }
      );
    }

    const config = normalizeLeadCaptureConfig(link.lead_capture_config);

    let responses = parsed.data.responses || {};
    if (!parsed.data.responses && parsed.data.email) {
      const emailField = config.fields.find((f) => f.type === "email");
      const nameField = config.fields.find(
        (f) => f.type === "text" && /name/i.test(f.label)
      );
      responses = {
        [emailField?.id || "email"]: parsed.data.email,
        ...(parsed.data.name && nameField
          ? { [nameField.id]: parsed.data.name }
          : {}),
      };
    }

    const validated = validateLeadResponses(config, responses);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("link_email_captures")
      .insert({
        link_id: link.id,
        email: validated.email,
        name: validated.name,
        responses: validated.responses,
      });

    if (insertError && insertError.code !== "23505") {
      throw new Error(insertError.message);
    }

    // Duplicate email: still grant access cookie
    if (insertError?.code === "23505") {
      // no-op — treat as success
    }

    const response = NextResponse.json({
      ok: true,
      short_code: link.short_code,
      duplicate: insertError?.code === "23505",
    });

    response.cookies.set(
      getLeadAccessCookieName(link.short_code),
      signLeadAccess(link.id),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return response;
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture email" },
      { status: 500 }
    );
  }
}
