// API Usage Repository - Database Module
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/lib/supabase/client";

export interface ApiUsage {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  created_at: string;
}

export interface CreateApiUsageInput {
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
}

export interface ApiUsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  requests_by_endpoint: Record<string, number>;
  requests_by_status: Record<number, number>;
  requests_by_day: Record<string, number>;
}

export class ApiUsageRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Record API usage
   */
  async recordUsage(input: CreateApiUsageInput): Promise<void> {
    const { error } = await this.supabase
      .from("api_usage")
      .insert({
        api_key_id: input.api_key_id,
        endpoint: input.endpoint,
        method: input.method,
        status_code: input.status_code,
        response_time_ms: input.response_time_ms || null,
      });

    if (error) {
      console.error("Failed to record API usage:", error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get usage stats for an API key
   */
  async getStats(apiKeyId: string, days: number = 30): Promise<ApiUsageStats> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from("api_usage")
      .select("*")
      .eq("api_key_id", apiKeyId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get API usage stats: ${error.message}`);
    }

    const usages = data || [];
    const total = usages.length;
    const successful = usages.filter((u) => u.status_code >= 200 && u.status_code < 300).length;
    const failed = total - successful;

    const responseTimes = usages
      .map((u) => u.response_time_ms)
      .filter((rt): rt is number => rt !== null);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const byEndpoint: Record<string, number> = {};
    const byStatus: Record<number, number> = {};
    const byDay: Record<string, number> = {};

    usages.forEach((usage) => {
      byEndpoint[usage.endpoint] = (byEndpoint[usage.endpoint] || 0) + 1;
      byStatus[usage.status_code] = (byStatus[usage.status_code] || 0) + 1;
      const day = new Date(usage.created_at).toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total_requests: total,
      successful_requests: successful,
      failed_requests: failed,
      average_response_time: Math.round(avgResponseTime),
      requests_by_endpoint: byEndpoint,
      requests_by_status: byStatus,
      requests_by_day: byDay,
    };
  }

  /**
   * Get usage stats for all API keys of a user
   */
  async getUserStats(userId: string, days: number = 30): Promise<ApiUsageStats> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all API keys for user
    const { data: apiKeys } = await this.supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", userId);

    if (!apiKeys || apiKeys.length === 0) {
      return {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        average_response_time: 0,
        requests_by_endpoint: {},
        requests_by_status: {},
        requests_by_day: {},
      };
    }

    const apiKeyIds = apiKeys.map((k) => k.id);

    const { data, error } = await this.supabase
      .from("api_usage")
      .select("*")
      .in("api_key_id", apiKeyIds)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get API usage stats: ${error.message}`);
    }

    const usages = data || [];
    const total = usages.length;
    const successful = usages.filter((u) => u.status_code >= 200 && u.status_code < 300).length;
    const failed = total - successful;

    const responseTimes = usages
      .map((u) => u.response_time_ms)
      .filter((rt): rt is number => rt !== null);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const byEndpoint: Record<string, number> = {};
    const byStatus: Record<number, number> = {};
    const byDay: Record<string, number> = {};

    usages.forEach((usage) => {
      byEndpoint[usage.endpoint] = (byEndpoint[usage.endpoint] || 0) + 1;
      byStatus[usage.status_code] = (byStatus[usage.status_code] || 0) + 1;
      const day = new Date(usage.created_at).toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total_requests: total,
      successful_requests: successful,
      failed_requests: failed,
      average_response_time: Math.round(avgResponseTime),
      requests_by_endpoint: byEndpoint,
      requests_by_status: byStatus,
      requests_by_day: byDay,
    };
  }
}

