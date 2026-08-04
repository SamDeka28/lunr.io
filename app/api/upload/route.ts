import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  removeImage,
  storagePathFromPublicUrl,
  uploadImage,
} from "@/lib/supabase/storage";

const ALLOWED_PREFIXES = new Set(["pages", "avatars", "qr"]);

// POST /api/upload — auth-checked image upload to the lunr bucket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentTypeHeader = request.headers.get("content-type") || "";

    let pathPrefix = "pages";
    let file: File | Blob | string | null = null;
    let contentType: string | undefined;

    if (contentTypeHeader.includes("multipart/form-data")) {
      const form = await request.formData();
      pathPrefix = String(form.get("pathPrefix") || "pages");
      const uploaded = form.get("file");
      if (uploaded instanceof File) {
        file = uploaded;
        contentType = uploaded.type;
      } else if (typeof uploaded === "string") {
        file = uploaded;
        contentType = String(form.get("contentType") || "image/jpeg");
      }
    } else {
      const body = await request.json();
      pathPrefix = body.pathPrefix || "pages";
      file = body.file || body.base64 || null;
      contentType = body.contentType;
    }

    if (!ALLOWED_PREFIXES.has(pathPrefix)) {
      return NextResponse.json(
        { error: "Invalid pathPrefix. Use pages, avatars, or qr." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file instanceof Blob && file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
    }

    if (
      contentType &&
      !ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])
    ) {
      return NextResponse.json(
        { error: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    const result = await uploadImage({
      supabase,
      userId: user.id,
      pathPrefix,
      file,
      contentType,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

// DELETE /api/upload — remove an image the user owns
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const path: string =
      body.path ||
      (body.publicUrl ? storagePathFromPublicUrl(body.publicUrl) : null) ||
      "";

    if (!path) {
      return NextResponse.json({ error: "path or publicUrl required" }, { status: 400 });
    }

    // Enforce ownership: second segment must be the user id
    // Structure: {pathPrefix}/{userId}/...
    const segments = path.split("/");
    if (segments.length < 3 || segments[1] !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await removeImage(supabase, path);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
