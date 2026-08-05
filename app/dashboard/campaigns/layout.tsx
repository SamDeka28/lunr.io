import { redirect } from "next/navigation";
import { isCampaignsEnabled } from "@/lib/features";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isCampaignsEnabled()) {
    redirect("/dashboard");
  }
  return children;
}
