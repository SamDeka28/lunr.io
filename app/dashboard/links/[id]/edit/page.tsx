import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LinkEditForm from "./edit-form";

export default async function EditLinkPage({
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

  // Plan checks are now handled in the client component via Zustand store
  return <LinkEditForm link={link} existingQRCode={existingQRCode} />;
}
