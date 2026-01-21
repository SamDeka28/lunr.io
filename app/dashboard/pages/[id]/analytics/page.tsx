import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageAnalyticsClient } from "./analytics-client";

export default async function PageAnalyticsPage({
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

  // Fetch page details
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (pageError || !page) {
    redirect("/dashboard/pages");
  }

  return <PageAnalyticsClient page={page} />;
}

