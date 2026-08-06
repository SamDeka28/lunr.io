import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { PageHeader } from "@/components/ui/page-header";
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
    <DashboardContainer>
      <PageHeader
        title="New campaign"
        description="Open Campaign Studio — group links, set UTM defaults, and optionally add partners"
        actions={
          <Link
            href="/docs/campaigns/creating-campaigns"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-neutral-border bg-white text-sm font-semibold text-neutral-text hover:border-primary/40 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            Studio guide
          </Link>
        }
      />
      <CampaignForm userId={user.id} />
    </DashboardContainer>
  );
}
