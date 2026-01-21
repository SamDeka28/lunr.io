// Page Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import type { Page, CreatePageInput } from "@/types/database.types";

export class PageRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Create a new page
   */
  async create(userId: string, data: CreatePageInput): Promise<Page> {
    const { data: page, error } = await this.supabase
      .from("pages")
      .insert({
        user_id: userId,
        slug: data.slug.toLowerCase().trim(),
        title: data.title,
        description: data.description || null,
        content: data.content || {},
        background_color: data.background_color || "#FFFFFF",
        text_color: data.text_color || "#000000",
        button_color: data.button_color || "#3B82F6",
        button_text_color: data.button_text_color || "#FFFFFF",
        links: data.links || [],
        social_links: data.social_links || {},
        is_public: data.is_public !== undefined ? data.is_public : true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A page with this slug already exists");
      }
      throw new Error(`Failed to create page: ${error.message}`);
    }

    return page;
  }

  /**
   * Get page by ID
   */
  async getById(id: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get page: ${error.message}`);
    }

    return data;
  }

  /**
   * Get page by slug (public access)
   */
  async getBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from("pages")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .eq("is_active", true)
      .eq("is_public", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get page: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all pages for a user
   */
  async getByUserId(userId: string): Promise<Page[]> {
    const { data, error } = await this.supabase
      .from("pages")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get pages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update page
   */
  async update(id: string, updates: Partial<CreatePageInput>): Promise<Page> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.background_color !== undefined) updateData.background_color = updates.background_color;
    if (updates.text_color !== undefined) updateData.text_color = updates.text_color;
    if (updates.button_color !== undefined) updateData.button_color = updates.button_color;
    if (updates.button_text_color !== undefined) updateData.button_text_color = updates.button_text_color;
    if (updates.links !== undefined) updateData.links = updates.links;
    if (updates.social_links !== undefined) updateData.social_links = updates.social_links;
    if (updates.is_public !== undefined) updateData.is_public = updates.is_public;
    if (updates.slug !== undefined) updateData.slug = updates.slug.toLowerCase().trim();

    const { data, error } = await this.supabase
      .from("pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A page with this slug already exists");
      }
      throw new Error(`Failed to update page: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete page (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("pages")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    const { error } = await this.supabase.rpc("increment_page_view_count", {
      page_id: id,
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const page = await this.getById(id);
      if (page) {
        await this.supabase
          .from("pages")
          .update({ view_count: (page.view_count || 0) + 1 })
          .eq("id", id);
      }
    }
  }

  /**
   * Increment click count
   */
  async incrementClickCount(id: string): Promise<void> {
    const { error } = await this.supabase.rpc("increment_page_click_count", {
      page_id: id,
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const page = await this.getById(id);
      if (page) {
        await this.supabase
          .from("pages")
          .update({ click_count: (page.click_count || 0) + 1 })
          .eq("id", id);
      }
    }
  }
}

