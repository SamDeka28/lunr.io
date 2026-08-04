import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";
import PublicPageViewer from "./public-page-viewer";

async function loadPage(slug: string) {
  const supabase = await createClient();
  const pageService = new PageService(supabase);
  return pageService.getPageBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  const content = page.content || {};
  const ogImage =
    content.profileImageUrl ||
    content.bannerImageUrl ||
    content.backgroundImageUrl ||
    undefined;

  const title = page.title || "Lunr Page";
  const description =
    page.description || `Visit ${page.title} on Lunr`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/p/${page.slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

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

  const hdrs = await headers();
  await pageService.trackView(page.id, {
    referrer: hdrs.get("referer") || hdrs.get("referrer"),
    userAgent: hdrs.get("user-agent"),
  });

  return <PublicPageViewer page={page} />;
}
