import type { SupabaseClient } from "@supabase/supabase-js";

export const LUNR_BUCKET = "lunr";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type ImageUploadSource = File | Blob | string;

export interface UploadImageOptions {
  supabase: SupabaseClient;
  userId: string;
  /** First path segment, e.g. `pages`, `avatars`, `qr` */
  pathPrefix: string;
  file: ImageUploadSource;
  contentType?: string;
}

export interface UploadImageResult {
  path: string;
  publicUrl: string;
}

function assertValidContentType(contentType: string): void {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Invalid image type. Allowed: JPEG, PNG, WebP, GIF.");
  }
}

function assertValidSize(size: number): void {
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

async function toUploadBody(
  file: ImageUploadSource,
  contentType?: string
): Promise<{ body: Blob | Buffer; contentType: string; size: number }> {
  if (typeof file === "string") {
    // data URL or raw base64
    const dataUrlMatch = file.match(/^data:([^;]+);base64,(.+)$/);
    const base64 = dataUrlMatch ? dataUrlMatch[2] : file;
    const inferredType = dataUrlMatch?.[1] || contentType || "image/jpeg";
    assertValidContentType(inferredType);

    const buffer = Buffer.from(base64, "base64");
    assertValidSize(buffer.length);
    return { body: buffer, contentType: inferredType, size: buffer.length };
  }

  const type = contentType || file.type || "image/jpeg";
  assertValidContentType(type);
  assertValidSize(file.size);

  return { body: file, contentType: type, size: file.size };
}

/**
 * Upload an image to the `lunr` bucket.
 * Path structure: `{pathPrefix}/{userId}/{uuid}.{ext}`
 * e.g. `pages/{userId}/...`, `avatars/{userId}/...`, `qr/{userId}/...`
 */
export async function uploadImage({
  supabase,
  userId,
  pathPrefix,
  file,
  contentType,
}: UploadImageOptions): Promise<UploadImageResult> {
  if (!userId) {
    throw new Error("userId is required");
  }
  if (!pathPrefix || pathPrefix.includes("/")) {
    throw new Error("pathPrefix must be a single folder segment (e.g. pages, avatars, qr)");
  }

  const { body, contentType: resolvedType } = await toUploadBody(file, contentType);
  const ext = EXT_BY_TYPE[resolvedType] || "jpg";
  const objectPath = `${pathPrefix}/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(LUNR_BUCKET).upload(objectPath, body, {
    contentType: resolvedType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LUNR_BUCKET).getPublicUrl(objectPath);

  return { path: objectPath, publicUrl };
}

/**
 * Remove an object from the `lunr` bucket by storage path.
 */
export async function removeImage(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  if (!path) return;

  const { error } = await supabase.storage.from(LUNR_BUCKET).remove([path]);
  if (error) {
    throw new Error(`Failed to remove image: ${error.message}`);
  }
}

/**
 * Extract storage path from a public URL when it points at the lunr bucket.
 */
export function storagePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${LUNR_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}
