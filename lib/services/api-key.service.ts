// API Key Service
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiKeyRepository, type ApiKey, type CreateApiKeyInput, type ApiKeyWithToken } from "@/lib/db/repositories/api-key.repository";
import { PlanService } from "./plan.service";

export class ApiKeyService {
  private apiKeyRepo: ApiKeyRepository;
  private planService: PlanService;

  constructor(supabaseClient?: SupabaseClient) {
    this.apiKeyRepo = new ApiKeyRepository(supabaseClient);
    this.planService = new PlanService(supabaseClient);
  }

  /**
   * Check if user has API access (Enterprise plan)
   */
  async hasApiAccess(userId: string): Promise<boolean> {
    return this.planService.hasFeature(userId, "api_access");
  }

  /**
   * Create a new API key
   */
  async createApiKey(input: CreateApiKeyInput): Promise<ApiKeyWithToken> {
    // Check if user has API access
    const hasAccess = await this.hasApiAccess(input.user_id);
    if (!hasAccess) {
      throw new Error("API access requires an Enterprise plan");
    }

    return this.apiKeyRepo.create(input);
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.getByUserId(userId);
  }

  /**
   * Authenticate API key
   */
  async authenticateApiKey(token: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyRepo.getByToken(token);
    
    if (apiKey) {
      // Update last used timestamp
      await this.apiKeyRepo.updateLastUsed(apiKey.id);
    }

    return apiKey;
  }

  /**
   * Update API key
   */
  async updateApiKey(
    keyId: string,
    updates: {
      name?: string;
      is_active?: boolean;
      expires_at?: string | null;
    }
  ): Promise<ApiKey> {
    return this.apiKeyRepo.update(keyId, updates);
  }

  /**
   * Delete API key
   */
  async deleteApiKey(keyId: string): Promise<void> {
    return this.apiKeyRepo.delete(keyId);
  }
}

