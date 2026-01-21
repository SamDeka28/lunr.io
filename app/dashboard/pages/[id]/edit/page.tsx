import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditStudio from "./edit-studio";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Get page and verify ownership
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !page) {
    redirect("/dashboard/pages");
  }

  // Get user's links for selection
  const { data: links } = await supabase
    .from("links")
    .select("id, short_code, original_url, title")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <EditStudio page={page} userLinks={links || []} />;
}

