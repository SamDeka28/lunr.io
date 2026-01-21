// Custom hook to access plan data from Zustand store
import { useEffect } from "react";
import { useUserStore, useShouldRefresh } from "@/store/user-store";

export function usePlan() {
  const plan = useUserStore((state) => state.plan);
  const usage = useUserStore((state) => state.usage);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasFeature = useUserStore((state) => state.hasFeature);
  const canUseCustomBackHalf = useUserStore((state) => state.canUseCustomBackHalf);
  const canSetExpiration = useUserStore((state) => state.canSetExpiration);
  const canUseUTMParameters = useUserStore((state) => state.canUseUTMParameters);
  const canUseCustomDomains = useUserStore((state) => state.canUseCustomDomains);
  const canUsePages = useUserStore((state) => state.canUsePages);
  const refreshUserData = useUserStore((state) => state.refreshUserData);
  const updateUsage = useUserStore((state) => state.updateUsage);
  const user = useUserStore((state) => state.user);
  const shouldRefresh = useShouldRefresh();

  // Auto-refresh if data is stale or missing
  useEffect(() => {
    if (user && (shouldRefresh || !plan)) {
      refreshUserData();
    }
  }, [user, shouldRefresh, plan, refreshUserData]);

  return {
    plan,
    usage,
    isLoading,
    hasFeature,
    canUseCustomBackHalf,
    canSetExpiration,
    canUseUTMParameters,
    canUseCustomDomains,
    canUsePages,
    refreshUserData,
    updateUsage,
    isPremium: plan?.isPremium || false,
    planName: plan?.planName || "free",
    planDisplayName: plan?.planDisplayName || "Free",
  };
}

