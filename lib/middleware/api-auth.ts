
// API Authentication Middleware
import { NextRequest, NextResponse } from "next/server";
import { ApiKeyService } from "@/lib/services/api-key.service";
import { ApiUsageRepository } from "@/lib/db/repositories/api-usage.repository";
import { createClient } from "@/lib/supabase/server";

export interface AuthenticatedApiRequest extends NextRequest {
  apiKey?: {
    id: string;
    user_id: string;
    name: string;
  };
}

/**
 * Authenticate API request using API key
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ apiKey: any; user: any } | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    console.error("API authentication failed: No Authorization header");
    return null;
  }

  // Support both "Bearer <token>" and "ApiKey <token>" formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : authHeader.startsWith("ApiKey ")
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  if (!token || !token.startsWith("sk_")) {
    console.error("API authentication failed: Invalid token format. Token must start with 'sk_'");
    return null;
  }

  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("API authentication failed: SUPABASE_SERVICE_ROLE_KEY not configured");
      return null;
    }

    // Use service role client to bypass RLS for API key lookup
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const apiKeyService = new ApiKeyService(serviceSupabase);
    const apiKey = await apiKeyService.authenticateApiKey(token);

    if (!apiKey) {
      console.error("API authentication failed: API key not found, inactive, or expired. Token prefix:", token.substring(0, 12));
      return null;
    }

    // Get user profile using service role to bypass RLS
    const { data: profile, error: profileError } = await serviceSupabase
      .from("profiles")
      .select("id, email")
      .eq("id", apiKey.user_id)
      .single();
    
    if (profileError || !profile) {
      console.error("API authentication failed: Profile not found", profileError);
      return null;
    }

    return {
      apiKey: {
        id: apiKey.id,
        user_id: apiKey.user_id,
        name: apiKey.name,
      },
      user: {
        id: profile.id,
        email: profile.email,
      },
    };
  } catch (error) {
    console.error("API authentication error:", error);
    return null;
  }
}

/**
 * Middleware wrapper for API routes with usage tracking
 */
export function withApiAuth(
  handler: (request: AuthenticatedApiRequest, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const startTime = Date.now();
    const auth = await authenticateApiRequest(request);

    if (!auth) {
      const authHeader = request.headers.get("Authorization");
      const hasToken = !!authHeader;
      const tokenFormat = authHeader?.startsWith("Bearer ") || authHeader?.startsWith("ApiKey ") || authHeader?.startsWith("sk_");
      
      return NextResponse.json(
        { 
          error: "Unauthorized. Valid API key required.",
          details: hasToken 
            ? (tokenFormat ? "API key not found, inactive, or expired" : "Invalid token format. Use 'Bearer sk_...' or 'ApiKey sk_...'")
            : "Missing Authorization header"
        },
        { status: 401 }
      );
    }

    // Attach API key and user to request
    (request as AuthenticatedApiRequest).apiKey = auth.apiKey;
    (request as any).user = auth.user;

    // Execute handler
    const response = await handler(request as AuthenticatedApiRequest, context);
    
    // Track API usage asynchronously
    const responseTime = Date.now() - startTime;
    const endpoint = request.nextUrl.pathname;
    const method = request.method;
    const statusCode = response.status;

    // Don't await - track in background using service role to bypass RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    const usageRepo = new ApiUsageRepository(serviceSupabase);
    usageRepo.recordUsage({
      api_key_id: auth.apiKey.id,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
    }).catch((error) => {
      console.error("Failed to record API usage:", error);
    });

    return response;
  };
}

