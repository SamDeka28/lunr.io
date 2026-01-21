// Plan Service - Check plan features and limits
import type { SupabaseClient } from "@supabase/supabase-js";
import { ProfileService } from "./profile.service";
import type { Plan, ProfileWithPlan } from "@/types/database.types";

export class PlanService {
  private profileService: ProfileService;

  constructor(supabaseClient?: SupabaseClient) {
    this.profileService = new ProfileService(supabaseClient);
  }

  /**
   * Get user's plan with profile
   */
  async getUserPlan(userId: string): Promise<ProfileWithPlan | null> {
    return await this.profileService.getProfileWithPlan(userId);
  }

  /**
   * Check if user has a specific feature
   */
  async hasFeature(userId: string, featureName: string): Promise<boolean> {
    try {
      const profileWithPlan = await this.getUserPlan(userId);
      if (!profileWithPlan || !profileWithPlan.plan) {
        console.warn(`[PlanService] No plan found for user ${userId}`);
        return false;
      }

      // Handle JSONB features - could be object or string
      let features = profileWithPlan.plan.features || {};
      
      // If features is a string, parse it
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          console.error(`[PlanService] Failed to parse features JSON:`, e);
          return false;
        }
      }

      // Check if feature exists and is true
      const hasFeature = features[featureName] === true;
      
      if (!hasFeature) {
        console.log(`[PlanService] Feature ${featureName} not enabled. Available features:`, Object.keys(features).filter(k => features[k] === true));
      }
      
      return hasFeature;
    } catch (error) {
      console.error(`[PlanService] Error checking feature ${featureName}:`, error);
      return false;
    }
  }

  /**
   * Check if user can use custom back-half
   */
  async canUseCustomBackHalf(userId: string): Promise<boolean> {
    return this.hasFeature(userId, "custom_back_half");
  }

  /**
   * Check if user can set expiration dates
   */
  async canSetExpiration(userId: string): Promise<boolean> {
    return this.hasFeature(userId, "expiration");
  }

  /**
   * Check if user can use UTM parameters
   */
  async canUseUTMParameters(userId: string): Promise<boolean> {
    return this.hasFeature(userId, "utm_parameters");
  }

  /**
   * Check if user can use custom domains
   */
  async canUseCustomDomains(userId: string): Promise<boolean> {
    return this.hasFeature(userId, "custom_domains");
  }

  /**
   * Check if user can create links
   */
  async canCreateLink(userId: string): Promise<boolean> {
    const limits = await this.profileService.getUsageLimits(userId);
    return limits.can_create_link;
  }

  /**
   * Check if user can create QR codes
   */
  async canCreateQR(userId: string): Promise<boolean> {
    const limits = await this.profileService.getUsageLimits(userId);
    return limits.can_create_qr;
  }

  /**
   * Check if user can create pages
   */
  async canCreatePage(userId: string): Promise<boolean> {
    const limits = await this.profileService.getUsageLimits(userId);
    return limits.can_create_page;
  }

  /**
   * Check if user can use pages feature
   */
  async canUsePages(userId: string): Promise<boolean> {
    return this.hasFeature(userId, "pages");
  }

  /**
   * Get usage limits
   */
  async getUsageLimits(userId: string) {
    return await this.profileService.getUsageLimits(userId);
  }

  /**
   * Validate link creation request against plan
   */
  async validateLinkCreation(userId: string, data: {
    short_code?: string;
    expires_at?: string | null;
    password?: string | null;
  }): Promise<{ valid: boolean; error?: string }> {
    // Check if user can create links
    if (!(await this.canCreateLink(userId))) {
      const limits = await this.getUsageLimits(userId);
      return {
        valid: false,
        error: `You've reached your limit of ${limits.max_links} links. Upgrade to create more.`,
      };
    }

    // Check custom back-half
    if (data.short_code && !(await this.canUseCustomBackHalf(userId))) {
      return {
        valid: false,
        error: "Custom back-half is a premium feature. Upgrade to use custom short codes.",
      };
    }

    // Check expiration
    if (data.expires_at && !(await this.canSetExpiration(userId))) {
      return {
        valid: false,
        error: "Link expiration is a premium feature. Upgrade to set expiration dates.",
      };
    }

    return { valid: true };
  }
}

