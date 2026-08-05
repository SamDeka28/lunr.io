import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsArticleClient } from "./docs-article-client";
import { docsContent } from "../../docs-content";
import { isCampaignsEnabled } from "@/lib/features";

export default async function DocsArticlePage({
  params,
}: {
  params: Promise<{ section: string; article: string }>;
}) {
  const { section, article } = await params;
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

  const articleData = sectionData.articles.find((a) => a.id === article);
  if (!articleData) {
    redirect(`/docs/${section}`);
  }

  return (
    <DocsArticleClient
      section={sectionData}
      article={articleData}
      isAuthenticated={!!user}
    />
  );
}

