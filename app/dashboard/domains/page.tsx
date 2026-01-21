import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DomainsPageClient } from "./domains-page-client";

export default async function DomainsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all custom domains for user's pages
  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const pageIds = pages?.map((p) => p.id) || [];

  let domains: any[] = [];
  if (pageIds.length > 0) {
    const { data: customDomains } = await supabase
      .from("custom_domains")
      .select("*")
      .in("page_id", pageIds)
      .order("created_at", { ascending: false });

    // Enrich domains with page information
    domains = (customDomains || []).map((domain) => {
      const page = pages?.find((p) => p.id === domain.page_id);
      return {
        ...domain,
        page: page ? { id: page.id, slug: page.slug, title: page.title } : null,
      };
    });
  }

  return <DomainsPageClient domains={domains} pages={pages || []} />;
}

