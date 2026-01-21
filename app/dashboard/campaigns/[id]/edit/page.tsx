import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "../../campaign-form";

export default async function EditCampaignPage({
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

  // Get campaign
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !campaign) {
    redirect("/dashboard/campaigns");
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-text mb-2">Edit Campaign</h1>
        <p className="text-sm text-neutral-muted">
          Update your campaign details
        </p>
      </div>

      <CampaignForm userId={user.id} campaign={campaign} />
    </div>
  );
}

