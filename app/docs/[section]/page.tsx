import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsSectionClient } from "./docs-section-client";
import { docsContent } from "../docs-content";

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

  const sectionData = docsContent.find((s) => s.id === section);
  
  if (!sectionData) {
    redirect("/docs");
  }

  return <DocsSectionClient section={sectionData} isAuthenticated={!!user} />;
}

