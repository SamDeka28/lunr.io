import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiKeyService } from "@/lib/services/api-key.service";

// PATCH /api/api-keys/[id] - Update an API key
export async function PATCH(
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

    const body = await request.json();
    const { name, is_active, expires_at } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (is_active !== undefined) updates.is_active = is_active;
    if (expires_at !== undefined) updates.expires_at = expires_at;

    const apiKeyService = new ApiKeyService(supabase);
    
    // Verify ownership
    const apiKeys = await apiKeyService.getUserApiKeys(user.id);
    const apiKey = apiKeys.find((k) => k.id === id);
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const updated = await apiKeyService.updateApiKey(id, updates);
    const { key_hash, ...sanitized } = updated;

    return NextResponse.json({ apiKey: sanitized });
  } catch (error: any) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update API key" },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(
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
    
    // Verify ownership
    const apiKeys = await apiKeyService.getUserApiKeys(user.id);
    const apiKey = apiKeys.find((k) => k.id === id);
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await apiKeyService.deleteApiKey(id);

    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete API key" },
      { status: 500 }
    );
  }
}

