import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { PageService } from "@/lib/services/page.service";
import { PageAnalyticsClient } from "./analytics-client";

export default async function PageAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (pageError || !page) {
    redirect("/dashboard/pages");
  }

  const pageService = new PageService(supabase);
  const links = Array.isArray(page.links) ? page.links : [];
  const analytics = await pageService.getAnalyticsSummary(
    page.id,
    links.map((l: any) => ({ id: l.id, title: l.title }))
  );

  return <PageAnalyticsClient page={page} analytics={analytics} />;
}
