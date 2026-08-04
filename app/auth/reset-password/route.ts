import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  let email: string | undefined;

  try {
    const body = await request.json();
    if (typeof body?.email === "string" && body.email.trim()) {
      email = body.email.trim();
    }
  } catch {
    // No JSON body — fall through to session-based email
  }

  // Prefer email from body (unauthenticated forgot-password).
  // Fall back to the logged-in user's email for authenticated reset requests.
  if (!email) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? undefined;
  }

  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password/confirm`,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ message: "Password reset email sent" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
