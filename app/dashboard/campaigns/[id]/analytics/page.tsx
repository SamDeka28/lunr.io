import { redirect } from "next/navigation";

/** Legacy analytics route — campaign workspace Analytics tab is canonical. */
export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/campaigns/${id}?tab=analytics`);
}
