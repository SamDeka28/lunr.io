import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";
import PublicPageViewer from "./public-page-viewer";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const pageService = new PageService(supabase);
  const page = await pageService.getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Track view
  await pageService.trackView(page.id);

  return <PublicPageViewer page={page} />;
}

