// API Key Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";
import { randomBytes, createHash } from "crypto";

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyInput {
  user_id: string;
  name: string;
  expires_at?: string | null;
}

export interface ApiKeyWithToken extends Omit<ApiKey, "key_hash"> {
  token: string; // Only returned when creating a new key
}

export class ApiKeyRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Generate a secure API key
   */
  private generateApiKey(): string {
    // Generate a 64-character random string
    return `sk_${randomBytes(32).toString("hex")}`;
  }

  /**
   * Hash an API key for storage
   */
  private hashApiKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
  }

  /**
   * Create a new API key
   */
  async create(input: CreateApiKeyInput): Promise<ApiKeyWithToken> {
    const token = this.generateApiKey();
    const keyHash = this.hashApiKey(token);
    const keyPrefix = token.substring(0, 12); // First 12 chars for display

    const { data, error } = await this.supabase
      .from("api_keys")
      .insert({
        user_id: input.user_id,
        name: input.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        expires_at: input.expires_at || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return {
      ...data,
      token, // Return the plain token only once
    };
  }

  /**
   * Get API key by hash
   */
  async getByHash(keyHash: string): Promise<ApiKey | null> {
    const { data, error } = await this.supabase
      .from("api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching API key by hash:", error.message, error.code);
      return null;
    }

    if (!data) {
      console.error("API key not found for hash:", keyHash.substring(0, 16) + "...");
      return null;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.error("API key expired:", data.id);
      return null;
    }

    return data;
  }

  /**
   * Get API key by token (for authentication)
   */
  async getByToken(token: string): Promise<ApiKey | null> {
    const keyHash = this.hashApiKey(token);
    return this.getByHash(keyHash);
  }

  /**
   * Get all API keys for a user
   */
  async getByUserId(userId: string): Promise<ApiKey[]> {
    const { data, error } = await this.supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get API keys: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update API key last used timestamp
   */
  async updateLastUsed(keyId: string): Promise<void> {
    const { error } = await this.supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyId);

    if (error) {
      console.error("Failed to update API key last used:", error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Update API key
   */
  async update(
    keyId: string,
    updates: {
      name?: string;
      is_active?: boolean;
      expires_at?: string | null;
    }
  ): Promise<ApiKey> {
    const { data, error } = await this.supabase
      .from("api_keys")
      .update(updates)
      .eq("id", keyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update API key: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete API key
   */
  async delete(keyId: string): Promise<void> {
    const { error } = await this.supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId);

    if (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  }
}

