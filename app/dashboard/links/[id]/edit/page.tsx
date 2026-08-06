import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import LinkEditForm from "./edit-form";

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Get link and verify ownership, including QR codes
  const { data: link, error } = await supabase
    .from("links")
    .select("*, qr_codes(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !link) {
    redirect("/dashboard/links");
  }

  // Get the most recent active QR code for this link
  const qrCodes = (link.qr_codes || []).filter((qr: any) => qr.is_active);
  const existingQRCode = qrCodes.length > 0 ? qrCodes[0] : null;

  const { data: metaRows } = await supabase
    .from("links")
    .select("folder, tags")
    .eq("user_id", user.id);

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

  return (
    <LinkEditForm
      link={link}
      existingQRCode={existingQRCode}
      availableFolders={Array.from(folderSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      )}
      availableTags={Array.from(tagSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      )}
    />
  );
}
