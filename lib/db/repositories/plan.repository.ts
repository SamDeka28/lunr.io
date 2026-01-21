// Plan Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Plan } from "@/types/database.types";

export class PlanRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Get all active plans
   */
  async getAllActive(): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      throw new Error(`Failed to get plans: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get plan by ID
   */
  async getById(planId: string): Promise<Plan | null> {
    const { data, error } = await this.supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get plan: ${error.message}`);
    }

    return data;
  }

  /**
   * Get plan by name
   */
  async getByName(name: string): Promise<Plan | null> {
    const { data, error } = await this.supabase
      .from("plans")
      .select("*")
      .eq("name", name)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get plan: ${error.message}`);
    }

    return data;
  }
}

