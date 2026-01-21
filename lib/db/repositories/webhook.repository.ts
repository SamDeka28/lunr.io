// Webhook Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import { randomBytes } from "crypto";

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookInput {
  user_id: string;
  name: string;
  url: string;
  events: string[];
}

export class WebhookRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Generate a webhook secret
   */
  private generateSecret(): string {
    return `whsec_${randomBytes(32).toString("hex")}`;
  }

  /**
   * Create a new webhook
   */
  async create(input: CreateWebhookInput): Promise<Webhook> {
    const secret = this.generateSecret();

    const { data, error } = await this.supabase
      .from("webhooks")
      .insert({
        user_id: input.user_id,
        name: input.name,
        url: input.url,
        events: input.events,
        secret: secret,
        is_active: true,
        failure_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create webhook: ${error.message}`);
    }

    return data;
  }

  /**
   * Get webhook by ID
   */
  async getById(webhookId: string, userId: string): Promise<Webhook | null> {
    const { data, error } = await this.supabase
      .from("webhooks")
      .select("*")
      .eq("id", webhookId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get all webhooks for a user
   */
  async getByUserId(userId: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get webhooks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active webhooks for a user by event type
   */
  async getActiveByEvent(userId: string, event: string): Promise<Webhook[]> {
    try {
      const { data, error } = await this.supabase
        .from("webhooks")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .contains("events", [event]);

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.message?.includes("Could not find the table") || error.code === "42P01") {
          console.warn("Webhooks table not found. Please apply the migration: supabase/migrations/add_webhooks_and_api_usage.sql");
          return [];
        }
        throw new Error(`Failed to get webhooks: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      // Catch any other errors and return empty array
      if (error.message?.includes("Could not find the table") || error.code === "42P01") {
        console.warn("Webhooks table not found. Please apply the migration: supabase/migrations/add_webhooks_and_api_usage.sql");
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Update webhook
   */
  async update(
    webhookId: string,
    updates: {
      name?: string;
      url?: string;
      events?: string[];
      is_active?: boolean;
    }
  ): Promise<Webhook> {
    const { data, error } = await this.supabase
      .from("webhooks")
      .update(updates)
      .eq("id", webhookId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }

    return data;
  }

  /**
   * Update webhook last triggered timestamp
   */
  async updateLastTriggered(webhookId: string, success: boolean): Promise<void> {
    const updates: any = { last_triggered_at: new Date().toISOString() };
    
    if (!success) {
      // Increment failure count
      const { data: webhook } = await this.supabase
        .from("webhooks")
        .select("failure_count")
        .eq("id", webhookId)
        .single();

      if (webhook) {
        updates.failure_count = (webhook.failure_count || 0) + 1;
      }
    } else {
      // Reset failure count on success
      updates.failure_count = 0;
    }

    await this.supabase
      .from("webhooks")
      .update(updates)
      .eq("id", webhookId);
  }

  /**
   * Delete webhook
   */
  async delete(webhookId: string): Promise<void> {
    const { error } = await this.supabase
      .from("webhooks")
      .delete()
      .eq("id", webhookId);

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }
}

