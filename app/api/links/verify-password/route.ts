import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkRepository } from "@/lib/db/repositories/link.repository";
import {
  getAccessCookieName,
  signLinkAccess,
} from "@/lib/utils/password";

/**
 * POST /api/links/verify-password
 * Body: { short_code, password }
 * On success sets an httpOnly access cookie and returns { ok: true }.
 * Password never travels in the query string.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { short_code, password } = body;

    if (!short_code || !password) {
      return NextResponse.json(
        { error: "short_code and password are required" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { rateLimit, RateLimitPresets } = await import("@/lib/utils/rate-limit");
    const rl = await rateLimit(
      `password:${ip}:${short_code}`,
      RateLimitPresets.password.limit,
      RateLimitPresets.password.windowMs
    );
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many password attempts. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const linkRepo = new LinkRepository(supabase);
    const link = await linkRepo.getByShortCode(short_code);

    if (!link || !link.password_hash) {
      return NextResponse.json(
        { error: "Link not found or not password-protected" },
        { status: 404 }
      );
    }

    const isValid = await linkRepo.verifyPassword(password, link.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true, short_code: link.short_code });
    response.cookies.set(
      getAccessCookieName(link.short_code),
      signLinkAccess(link.id, link.password_hash),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      }
    );

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify password" },
      { status: 500 }
    );
  }
}
