import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsSectionClient } from "./docs-section-client";
import { docsContent } from "../docs-content";
import { isCampaignsEnabled } from "@/lib/features";

export default async function DocsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (section === "campaigns" && !isCampaignsEnabled()) {
    redirect("/docs");
  }

  const sectionData = docsContent.find((s) => s.id === section);
  
  if (!sectionData) {
    redirect("/docs");
  }

  return <DocsSectionClient section={sectionData} isAuthenticated={!!user} />;
}

