import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsIndexClient } from "./docs-index-client";

export default async function DocsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DocsIndexClient isAuthenticated={!!user} />;
}
