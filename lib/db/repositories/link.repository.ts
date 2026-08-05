// Link Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Link, CreateLinkInput } from "@/types/database.types";
import { hashPassword as hashPasswordUtil, verifyPassword as verifyPasswordUtil } from "@/lib/utils/password";

export class LinkRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }
  /**
   * Create a new link
   */
  async create(data: CreateLinkInput & { short_code: string }): Promise<Link> {
    const { data: link, error } = await this.supabase
      .from("links")
      .insert({
        short_code: data.short_code,
        original_url: data.original_url,
        title: data.title || null,
        description: data.description || null,
        og_image_url: data.og_image_url || null,
        expires_at: data.expires_at || null,
        password_hash: data.password ? hashPasswordUtil(data.password) : null,
        user_id: data.user_id || null,
        campaign_id: data.campaign_id || null,
        utm_parameters: data.utm_parameters || null,
        tags: data.tags?.length ? data.tags : [],
        folder: data.folder || null,
        max_clicks: data.max_clicks ?? null,
        targeting: data.targeting || {},
        is_active: true,
        click_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create link: ${error.message}`);
    }

    return link;
  }

  /**
   * Get link by short code
   */
  async getByShortCode(shortCode: string): Promise<Link | null> {
    const { data, error } = await this.supabase
      .from("links")
      .select("*")
      .eq("short_code", shortCode)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to get link: ${error.message}`);
    }

    // Check if link has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data;
  }

  /**
   * Check if short code exists
   */
  async shortCodeExists(shortCode: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("links")
      .select("id")
      .eq("short_code", shortCode)
      .limit(1)
      .single();

    return !error && data !== null;
  }

  /**
   * Increment click count
   */
  async incrementClickCount(linkId: string): Promise<void> {
    // Try using the database function first (more efficient)
    const { error: functionError } = await this.supabase.rpc("increment_click_count", {
      link_id: linkId,
    });

    if (!functionError) {
      return; // Success
    }

    // Fallback to manual update if function doesn't work
    const { data: link, error: fetchError } = await this.supabase
      .from("links")
      .select("click_count")
      .eq("id", linkId)
      .single();

    if (fetchError || !link) {
      throw new Error(`Failed to fetch link: ${fetchError?.message}`);
    }

    // Update with incremented count
    const { error: updateError } = await this.supabase
      .from("links")
      .update({ click_count: (link.click_count || 0) + 1 })
      .eq("id", linkId);

    if (updateError) {
      throw new Error(`Failed to increment click count: ${updateError.message}`);
    }
  }

  /**
   * Get link by ID
   */
  async getById(id: string): Promise<Link | null> {
    const { data, error } = await this.supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get link: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete link (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("links")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete link: ${error.message}`);
    }
  }

  /**
   * Hash a password (scrypt + salt)
   */
  hashPassword(password: string): string {
    return hashPasswordUtil(password);
  }

  /**
   * Verify password against hash (scrypt or legacy SHA-256)
   */
  async verifyPassword(password: string, stored: string): Promise<boolean> {
    return verifyPasswordUtil(password, stored);
  }
}
