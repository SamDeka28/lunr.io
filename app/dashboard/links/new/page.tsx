import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { LinkCreationPage } from "./link-creation-page";
import { PlanService } from "@/lib/services/plan.service";

async function getLinkMeta(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: metaRows } = await supabase
    .from("links")
    .select("folder, tags")
    .eq("user_id", userId);

  const folderSet = new Set<string>();
  const tagSet = new Set<string>();
  for (const row of metaRows || []) {
    if (row.folder && String(row.folder).trim()) {
      folderSet.add(String(row.folder).trim());
    }
    if (Array.isArray(row.tags)) {
      for (const t of row.tags) {
        if (t && String(t).trim()) tagSet.add(String(t).trim());
      }
    }
  }
  return {
    availableFolders: Array.from(folderSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    ),
    availableTags: Array.from(tagSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    ),
  };
}

export default async function NewLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign_id?: string }> | { campaign_id?: string };
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const planService = new PlanService(supabase);
  const limits = await planService.getUsageLimits(user.id);

  if (!limits.can_create_link) {
    redirect("/dashboard/links");
  }

  const params = await Promise.resolve(searchParams);
  const { availableFolders, availableTags } = await getLinkMeta(supabase, user.id);

  return (
    <LinkCreationPage
      userId={user.id}
      initialCampaignId={params.campaign_id || ""}
      availableFolders={availableFolders}
      availableTags={availableTags}
    />
  );
}
