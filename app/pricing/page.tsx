import { createClient } from "@/lib/supabase/server";
import { ProfileService } from "@/lib/services/profile.service";
import { PricingPageClient } from "./pricing-page-client";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileService = new ProfileService(supabase);
  const availablePlans = await profileService.getAvailablePlans();

  return <PricingPageClient plans={availablePlans} isAuthenticated={!!user} />;
}

