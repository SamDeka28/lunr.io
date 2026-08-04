
// API Authentication Middleware
import { NextRequest, NextResponse } from "next/server";
import { ApiKeyService } from "@/lib/services/api-key.service";
import { ApiUsageRepository } from "@/lib/db/repositories/api-usage.repository";

export interface AuthenticatedApiRequest extends NextRequest {
  apiKey?: {
    id: string;
    user_id: string;
    name: string;
    scopes?: string[] | null;
  };
}

export type ApiScope =
  | "links:read"
  | "links:write"
  | "analytics:read"
  | "webhooks:read"
  | "webhooks:write"
  | "campaigns:read"
  | "campaigns:write"
  | "qr:read"
  | "qr:write"
  | "usage:read";

/**
 * Map /api/v1 path + method to required scope.
 * Returns null when no scope check is needed (or unknown path).
 */
export function resolveRequiredScope(
  pathname: string,
  method: string
): ApiScope | null {
  const path = pathname.replace(/\/+$/, "");
  const m = method.toUpperCase();

  // /api/v1/usage
  if (path.includes("/v1/usage")) {
    return "analytics:read";
  }

  // Analytics
  if (path.includes("/analytics")) {
    return "analytics:read";
  }

  // Webhooks
  if (path.includes("/webhooks")) {
    return m === "GET" ? "webhooks:read" : "webhooks:write";
  }

  // Campaigns → links scopes (migration default keys include links:*)
  if (path.includes("/campaigns")) {
    return m === "GET" ? "links:read" : "links:write";
  }

  // QR → links scopes
  if (path.includes("/qr")) {
    return m === "GET" ? "links:read" : "links:write";
  }

  // Links
  if (path.includes("/links")) {
    return m === "GET" ? "links:read" : "links:write";
  }

  return null;
}

/**
 * Check whether an API key's scopes allow the required scope.
 * Empty/null scopes = full access (legacy keys).
 * Also grants write when read is required if write is present for same resource.
 */
export function hasScope(
  scopes: string[] | null | undefined,
  required: ApiScope | null
): boolean {
  if (!required) return true;
  if (!scopes || scopes.length === 0) return true; // legacy / unrestricted
  if (scopes.includes(required)) return true;

  // links:write implies links:read, etc.
  const [resource, action] = required.split(":");
  if (action === "read" && scopes.includes(`${resource}:write`)) {
    return true;
  }

  return false;
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
        scopes: (apiKey as any).scopes || null,
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
 * Middleware wrapper for API routes with usage tracking and api_access plan check
 */
export function withApiAuth(
  handler: (request: AuthenticatedApiRequest, context: any) => Promise<NextResponse>,
  options?: { requiredScope?: ApiScope }
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

    // Recheck api_access on every v1 request
    try {
      const { createServiceClient } = await import("@/lib/supabase/admin");
      const { PlanService } = await import("@/lib/services/plan.service");
      const serviceSupabase = createServiceClient();
      const planService = new PlanService(serviceSupabase);
      const hasApiAccess = await planService.hasFeature(auth.user.id, "api_access");
      if (!hasApiAccess) {
        return NextResponse.json(
          { error: "API access is not included in your plan. Upgrade to Enterprise to use the API." },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Failed to verify api_access:", error);
      return NextResponse.json(
        { error: "Failed to verify API access" },
        { status: 500 }
      );
    }

    // Scope check
    const requiredScope =
      options?.requiredScope ??
      resolveRequiredScope(request.nextUrl.pathname, request.method);

    if (!hasScope(auth.apiKey.scopes, requiredScope)) {
      return NextResponse.json(
        {
          error: "Forbidden. API key missing required scope.",
          required_scope: requiredScope,
          scopes: auth.apiKey.scopes || [],
        },
        { status: 403 }
      );
    }

    // Rate limit per API key
    try {
      const { rateLimit, RateLimitPresets, rateLimitHeaders } = await import("@/lib/utils/rate-limit");
      const rl = await rateLimit(
        `api:${auth.apiKey.id}`,
        RateLimitPresets.api.limit,
        RateLimitPresets.api.windowMs
      );
      if (!rl.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429, headers: rateLimitHeaders(rl) }
        );
      }
      // Attach headers after handler via cloning below
      (request as any).__rateLimit = rl;
    } catch (error) {
      console.error("API rate limit error:", error);
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
    try {
      const { createServiceClient } = await import("@/lib/supabase/admin");
      const serviceSupabase = createServiceClient();
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
    } catch (error) {
      console.error("Failed to init usage tracking:", error);
    }

    // Add rate limit headers if present
    const rl = (request as any).__rateLimit;
    if (rl) {
      const { rateLimitHeaders } = await import("@/lib/utils/rate-limit");
      const headers = rateLimitHeaders(rl);
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    }

    return response;
  };
}
