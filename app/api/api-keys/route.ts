import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiKeyService } from "@/lib/services/api-key.service";

// GET /api/api-keys - Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeyService = new ApiKeyService(supabase);
    const apiKeys = await apiKeyService.getUserApiKeys(user.id);

    // Remove sensitive data (key_hash) from response
    const sanitizedKeys = apiKeys.map(({ key_hash, ...rest }) => rest);

    return NextResponse.json({ apiKeys: sanitizedKeys });
  } catch (error: any) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, expires_at } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const apiKeyService = new ApiKeyService(supabase);
    const apiKey = await apiKeyService.createApiKey({
      user_id: user.id,
      name: name.trim(),
      expires_at: expires_at || null,
    });

    // Return only the token (not the full key object with hash)
    return NextResponse.json({
      token: apiKey.token,
      id: apiKey.id,
      name: apiKey.name,
      key_prefix: apiKey.key_prefix,
      created_at: apiKey.created_at,
    });
  } catch (error: any) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create API key" },
      { status: 400 }
    );
  }
}

