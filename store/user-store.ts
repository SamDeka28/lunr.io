// User Store - Global state management with Zustand
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileWithPlan, UsageLimits } from "@/types/database.types";

interface UserState {
  // User data
  user: {
    id: string;
    email: string | null;
  } | null;
  
  // Plan data
  plan: {
    planName: string;
    planDisplayName: string;
    planId: string | null;
    isPremium: boolean;
    features: Record<string, boolean>;
    maxLinks: number;
    maxQRCodes: number;
    maxPages: number;
  } | null;
  
  // Usage data
  usage: {
    usedLinks: number;
    usedQRCodes: number;
    usedPages: number;
    remainingLinks: number;
    remainingQRCodes: number;
    remainingPages: number;
    canCreateLink: boolean;
    canCreateQR: boolean;
    canCreatePage: boolean;
  } | null;
  
  // Full profile data (optional, for detailed views)
  profile: ProfileWithPlan | null;
  
  // Loading states
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setUser: (user: { id: string; email: string | null } | null) => void;
  setPlan: (plan: {
    planName: string;
    planDisplayName: string;
    planId: string | null;
    isPremium: boolean;
    features: Record<string, boolean>;
    maxLinks: number;
    maxQRCodes: number;
    maxPages: number;
  } | null) => void;
  setUsage: (usage: UsageLimits) => void;
  setProfile: (profile: ProfileWithPlan | null) => void;
  setLoading: (loading: boolean) => void;
  updateUsage: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearStore: () => void;
  
  // Feature checks
  hasFeature: (featureName: string) => boolean;
  canUseCustomBackHalf: () => boolean;
  canSetExpiration: () => boolean;
  canUseUTMParameters: () => boolean;
  canUseCustomDomains: () => boolean;
  canUsePages: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      plan: null,
      usage: null,
      profile: null,
      isLoading: false,
      lastFetched: null,

      setUser: (user) => set({ user }),

      setPlan: (plan) => set({ plan }),

      setUsage: (usage) => set({ usage }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateUsage: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const response = await fetch("/api/user/usage");
          if (response.ok) {
            const usageData = await response.json();
            // Map usage data from snake_case to camelCase
            const usage = {
              usedLinks: usageData.used_links ?? 0,
              usedQRCodes: usageData.used_qr_codes ?? 0,
              usedPages: usageData.used_pages ?? 0,
              remainingLinks: usageData.remaining_links === -1 ? Infinity : (usageData.remaining_links ?? 0),
              remainingQRCodes: usageData.remaining_qr_codes === -1 ? Infinity : (usageData.remaining_qr_codes ?? 0),
              remainingPages: usageData.remaining_pages === -1 ? Infinity : (usageData.remaining_pages ?? 0),
              canCreateLink: usageData.can_create_link ?? false,
              canCreateQR: usageData.can_create_qr ?? false,
              canCreatePage: usageData.can_create_page ?? false,
            };
            set({ usage, lastFetched: Date.now() });
          }
        } catch (error) {
          console.error("Failed to update usage:", error);
        }
      },

      refreshUserData: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            const profile = data.profile;
            const usageData = data.usage;

            // Map usage data from snake_case to camelCase
            const usage = usageData ? {
              usedLinks: usageData.used_links ?? 0,
              usedQRCodes: usageData.used_qr_codes ?? 0,
              usedPages: usageData.used_pages ?? 0,
              remainingLinks: usageData.remaining_links === -1 ? Infinity : (usageData.remaining_links ?? 0),
              remainingQRCodes: usageData.remaining_qr_codes === -1 ? Infinity : (usageData.remaining_qr_codes ?? 0),
              remainingPages: usageData.remaining_pages === -1 ? Infinity : (usageData.remaining_pages ?? 0),
              canCreateLink: usageData.can_create_link ?? false,
              canCreateQR: usageData.can_create_qr ?? false,
              canCreatePage: usageData.can_create_page ?? false,
            } : null;

            if (profile?.plan) {
              const plan = {
                planName: profile.plan.name,
                planDisplayName: profile.plan.display_name,
                planId: profile.plan.id,
                isPremium: profile.plan.name.toLowerCase() !== "free",
                features: profile.plan.features || {},
                maxLinks: profile.plan.max_links === -1 ? Infinity : profile.plan.max_links,
                maxQRCodes: profile.plan.max_qr_codes === -1 ? Infinity : profile.plan.max_qr_codes,
                maxPages: profile.plan.max_pages === -1 ? Infinity : profile.plan.max_pages,
              };

              set({
                plan,
                usage,
                profile,
                lastFetched: Date.now(),
              });
            } else {
              // Default to free plan if no plan found
              set({
                plan: {
                  planName: "free",
                  planDisplayName: "Free",
                  planId: null,
                  isPremium: false,
                  features: {},
                  maxLinks: 2,
                  maxQRCodes: 2,
                  maxPages: 0,
                },
                usage,
                profile,
                lastFetched: Date.now(),
              });
            }
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearStore: () => {
        set({
          user: null,
          plan: null,
          usage: null,
          profile: null,
          isLoading: false,
          lastFetched: null,
        });
      },

      // Feature checks
      hasFeature: (featureName: string) => {
        const { plan } = get();
        if (!plan) return false;
        return plan.features[featureName] === true;
      },

      canUseCustomBackHalf: () => {
        return get().hasFeature("custom_back_half");
      },

      canSetExpiration: () => {
        return get().hasFeature("expiration");
      },

      canUseUTMParameters: () => {
        return get().hasFeature("utm_parameters");
      },

      canUseCustomDomains: () => {
        return get().hasFeature("custom_domains");
      },

      canUsePages: () => {
        return get().hasFeature("pages");
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        plan: state.plan,
        usage: state.usage,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

// Helper hook to check if data needs refresh
export const useShouldRefresh = () => {
  const lastFetched = useUserStore((state) => state.lastFetched);
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_DURATION;
};

