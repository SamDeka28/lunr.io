import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/auth";
import { CampaignForm } from "../campaign-form";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-text mb-2">Create Campaign</h1>
        <p className="text-sm text-neutral-muted">
          Organize your links into marketing campaigns
        </p>
      </div>

      <CampaignForm userId={user.id} />
    </div>
  );
}

