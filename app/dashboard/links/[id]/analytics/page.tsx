import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkAnalyticsClient } from "./analytics-client";

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch link details
  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (linkError || !link) {
    redirect("/dashboard/links");
  }

  // Fetch analytics stats
  const statsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/links/${id}/stats`,
    { cache: "no-store" }
  );
  const stats = statsResponse.ok ? await statsResponse.json() : null;

  return <LinkAnalyticsClient link={link} stats={stats} />;
}

