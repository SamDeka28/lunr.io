// Profile Management Service
import { ProfileRepository } from "@/lib/db/repositories/profile.repository";
import { PlanRepository } from "@/lib/db/repositories/plan.repository";
import type { Profile, ProfileWithPlan, UsageLimits } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ProfileService {
  private profileRepo: ProfileRepository;
  private planRepo: PlanRepository;

  constructor(supabaseClient?: SupabaseClient) {
    this.profileRepo = new ProfileRepository(supabaseClient);
    this.planRepo = new PlanRepository(supabaseClient);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<Profile | null> {
    return await this.profileRepo.getByUserId(userId);
  }

  /**
   * Get user profile with plan details
   */
  async getProfileWithPlan(userId: string): Promise<ProfileWithPlan | null> {
    return await this.profileRepo.getProfileWithPlan(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile> {
    return await this.profileRepo.update(userId, updates);
  }

  /**
   * Get usage limits for a user
   */
  async getUsageLimits(userId: string): Promise<UsageLimits> {
    return await this.profileRepo.getUsageLimits(userId);
  }

  /**
   * Check if user can create a link
   */
  async canCreateLink(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);
    return limits.can_create_link;
  }

  /**
   * Check if user can create a QR code
   */
  async canCreateQR(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);
    return limits.can_create_qr;
  }

  /**
   * Check if user can create a page
   */
  async canCreatePage(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);
    return limits.can_create_page;
  }

  /**
   * Upgrade user's plan
   */
  async upgradePlan(
    userId: string,
    planId: string,
    expiresAt?: string | null
  ): Promise<Profile> {
    // Verify plan exists
    const plan = await this.planRepo.getById(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    return await this.profileRepo.updatePlan(userId, planId, expiresAt);
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans() {
    return await this.planRepo.getAllActive();
  }
}

