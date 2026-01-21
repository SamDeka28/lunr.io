// Profile Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Profile, ProfileWithPlan } from "@/types/database.types";

export class ProfileRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Get profile by user ID
   */
  async getByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to get profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Get profile with plan details
   */
  async getProfileWithPlan(userId: string): Promise<ProfileWithPlan | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(`
        *,
        plan:plans(*)
      `)
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get profile with plan: ${error.message}`);
    }

    return {
      ...data,
      plan: data.plan || null,
    };
  }

  /**
   * Update profile
   */
  async update(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user's plan
   */
  async updatePlan(
    userId: string,
    planId: string,
    expiresAt?: string | null
  ): Promise<Profile> {
    return this.update(userId, {
      plan_id: planId,
      plan_started_at: new Date().toISOString(),
      plan_expires_at: expiresAt || null,
    });
  }

  /**
   * Reset usage counters (for monthly reset)
   */
  async resetUsage(userId: string): Promise<Profile> {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);

    return this.update(userId, {
      usage_links: 0,
      usage_qr_codes: 0,
      usage_pages: 0,
      usage_reset_at: nextReset.toISOString(),
    });
  }

  /**
   * Sync usage counters from actual database counts
   * This ensures usage is accurate even if triggers weren't set up initially
   */
  async syncUsageFromCounts(userId: string): Promise<void> {
    // Count actual active links
    const { count: linksCount } = await this.supabase
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Count actual active QR codes
    const { count: qrCount } = await this.supabase
      .from("qr_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Count actual active pages
    const { count: pagesCount } = await this.supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Update profile with actual counts
    await this.update(userId, {
      usage_links: linksCount || 0,
      usage_qr_codes: qrCount || 0,
      usage_pages: pagesCount || 0,
    });
  }

  /**
   * Get usage limits for a user
   */
  async getUsageLimits(userId: string, syncIfNeeded: boolean = true): Promise<{
    max_links: number;
    max_qr_codes: number;
    max_pages: number;
    used_links: number;
    used_qr_codes: number;
    used_pages: number;
    remaining_links: number;
    remaining_qr_codes: number;
    remaining_pages: number;
    can_create_link: boolean;
    can_create_qr: boolean;
    can_create_page: boolean;
  }> {
    const profile = await this.getProfileWithPlan(userId);
    
    if (!profile) {
      throw new Error("Profile not found");
    }

    const plan = profile.plan;
    const maxLinks = plan?.max_links === -1 ? Infinity : (plan?.max_links || 2);
    const maxQRCodes = plan?.max_qr_codes === -1 ? Infinity : (plan?.max_qr_codes || 2);
    const maxPages = plan?.max_pages === -1 ? Infinity : (plan?.max_pages || 0);
    
    let usedLinks = profile.usage_links || 0;
    let usedQRCodes = profile.usage_qr_codes || 0;
    let usedPages = profile.usage_pages || 0;

    // If sync is enabled, verify usage counts against actual database counts
    // This ensures accuracy even if triggers weren't set up initially
    if (syncIfNeeded) {
      // Always verify counts to ensure accuracy (especially for fresh accounts)
      // Count actual active items
      const { count: actualLinksCount } = await this.supabase
        .from("links")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true);

      const { count: actualQrCount } = await this.supabase
        .from("qr_codes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true);

      const { count: actualPagesCount } = await this.supabase
        .from("pages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true);

      // Get actual counts (handle null/undefined)
      const actualLinks = actualLinksCount ?? 0;
      const actualQr = actualQrCount ?? 0;
      const actualPages = actualPagesCount ?? 0;

      // If actual counts differ from stored usage, sync them
      if (
        actualLinks !== usedLinks ||
        actualQr !== usedQRCodes ||
        actualPages !== usedPages
      ) {
        usedLinks = actualLinks;
        usedQRCodes = actualQr;
        usedPages = actualPages;

        // Update profile with correct counts
        await this.update(userId, {
          usage_links: usedLinks,
          usage_qr_codes: usedQRCodes,
          usage_pages: usedPages,
        });
      }
    }

    const remainingLinks = maxLinks === Infinity ? Infinity : Math.max(0, maxLinks - usedLinks);
    const remainingQRCodes = maxQRCodes === Infinity ? Infinity : Math.max(0, maxQRCodes - usedQRCodes);
    const remainingPages = maxPages === Infinity ? Infinity : Math.max(0, maxPages - usedPages);

    // Check if pages feature is enabled
    let features = plan?.features || {};
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        features = {};
      }
    }
    const pagesFeatureEnabled = features.pages === true;

    return {
      max_links: maxLinks === Infinity ? -1 : maxLinks,
      max_qr_codes: maxQRCodes === Infinity ? -1 : maxQRCodes,
      max_pages: maxPages === Infinity ? -1 : maxPages,
      used_links: usedLinks,
      used_qr_codes: usedQRCodes,
      used_pages: usedPages,
      remaining_links: remainingLinks === Infinity ? -1 : remainingLinks,
      remaining_qr_codes: remainingQRCodes === Infinity ? -1 : remainingQRCodes,
      remaining_pages: remainingPages === Infinity ? -1 : remainingPages,
      can_create_link: remainingLinks > 0 || remainingLinks === Infinity,
      can_create_qr: remainingQRCodes > 0 || remainingQRCodes === Infinity,
      can_create_page: pagesFeatureEnabled && (remainingPages > 0 || remainingPages === Infinity),
    };
  }
}

