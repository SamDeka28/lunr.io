import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiKeyService } from "@/lib/services/api-key.service";

// POST /api/api-keys/[id]/rotate — regenerate API key secret
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeyService = new ApiKeyService(supabase);
    const apiKeys = await apiKeyService.getUserApiKeys(user.id);
    const apiKey = apiKeys.find((k) => k.id === id);

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const rotated = await apiKeyService.rotateApiKey(id);

    return NextResponse.json({
      token: rotated.token,
      id: rotated.id,
      name: rotated.name,
      key_prefix: rotated.key_prefix,
      scopes: rotated.scopes || [],
      message: "API key rotated. Copy the new token — it will not be shown again.",
    });
  } catch (error: any) {
    console.error("Error rotating API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rotate API key" },
      { status: 500 }
    );
  }
}
