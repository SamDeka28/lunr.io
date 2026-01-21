import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return new Response(
      JSON.stringify({ error: "User not found" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/reset-password/confirm`,
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

