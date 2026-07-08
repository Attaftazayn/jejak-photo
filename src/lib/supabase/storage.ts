// src/lib/supabase/storage.ts
// Helper functions for uploading original photos, generated previews, and watermarked versions to Supabase Storage.

import { createServerSupabase } from "./server";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file buffer to a Supabase storage bucket.
 * Returns the public URL (if bucket is public) or signed URL.
 */
export async function uploadToBucket(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string,
  isPublic: boolean = false
): Promise<string> {
  const supabase = await createServerSupabase();
  let { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    if (error.message?.toLowerCase().includes("not found") || error.status === 404) {
      // Try to create the bucket
      const { error: createErr } = await supabase.storage.createBucket(bucket, {
        public: isPublic,
      });
      if (createErr) {
        throw new Error(`Bucket "${bucket}" not found and creation failed: ${createErr.message}`);
      }
      // Retry upload
      const retryRes = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType,
          upsert: true,
        });
      if (retryRes.error) throw retryRes.error;
      data = retryRes.data;
    } else {
      throw error;
    }
  }

  if (isPublic) {
    // Public bucket: construct public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    // Private bucket: generate signed URL (valid for 1 hour)
    const { data: signed, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);
    if (signErr) throw signErr;
    return signed?.signedUrl ?? "";
  }
}

/**
 * Upload original photo (private).
 */
export async function uploadOriginal(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const id = uuidv4();
  const path = `${id}/${filename}`;
  return await uploadToBucket("original", path, file, mimeType, false);
}

/**
 * Upload generated preview (public).
 */
export async function uploadPreview(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const id = uuidv4();
  const path = `${id}/${filename}`;
  return await uploadToBucket("preview", path, file, mimeType, true);
}

/**
 * Upload watermarked version (private).
 */
export async function uploadWatermarked(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const id = uuidv4();
  const path = `${id}/${filename}`;
  return await uploadToBucket("watermarked", path, file, mimeType, false);
}

/**
 * Upload album cover image (public).
 */
export async function uploadCover(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const id = uuidv4();
  const path = `${id}/${filename}`;
  return await uploadToBucket("covers", path, file, mimeType, true);
}

// ─── UTILITIES FOR DELETING AND PARSING STORAGE FILES ─────────────────────────

/**
 * Parses a Supabase URL to extract the relative storage path for a given bucket.
 */
export function parseStoragePathFromUrl(url: string, bucket: string): string | null {
  if (!url) return null;
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const pathWithQuery = url.substring(index + marker.length);
  const pathWithoutQuery = pathWithQuery.split("?")[0];
  return decodeURIComponent(pathWithoutQuery);
}

/**
 * Deletes a file by its relative path from a bucket.
 * Logs warning on failure but does not throw.
 */
export async function deleteFromBucket(bucket: string, path: string): Promise<void> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn(`Warning: failed to delete file ${path} from bucket ${bucket}:`, error.message);
    }
  } catch (e: any) {
    console.warn(`Warning: failed to delete file ${path} from bucket ${bucket}:`, e?.message || e);
  }
}

/**
 * Deletes a file from a bucket using its public/signed URL.
 */
export async function deleteFileByUrl(bucket: string, url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = parseStoragePathFromUrl(url, bucket);
  if (path) {
    await deleteFromBucket(bucket, path);
  } else {
    console.warn(`Warning: could not parse storage path for bucket ${bucket} from URL: ${url}`);
  }
}

/**
 * Deletes multiple files from a bucket using their URLs.
 */
export async function deleteMultipleFilesByUrl(bucket: string, urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls
    .map(url => url ? parseStoragePathFromUrl(url, bucket) : null)
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      console.warn(`Warning: failed to delete multiple files from bucket ${bucket}:`, error.message);
    }
  } catch (e: any) {
    console.warn(`Warning: failed to delete multiple files from bucket ${bucket}:`, e?.message || e);
  }
}

export async function deleteCoverByUrl(url: string | null | undefined): Promise<void> {
  await deleteFileByUrl("covers", url);
}

export async function deletePreviewByUrl(url: string | null | undefined): Promise<void> {
  await deleteFileByUrl("preview", url);
}

export async function deleteOriginalByUrl(url: string | null | undefined): Promise<void> {
  await deleteFileByUrl("original", url);
}

export default {
  uploadOriginal,
  uploadPreview,
  uploadWatermarked,
  uploadCover,
  parseStoragePathFromUrl,
  deleteFromBucket,
  deleteFileByUrl,
  deleteMultipleFilesByUrl,
  deleteCoverByUrl,
  deletePreviewByUrl,
  deleteOriginalByUrl,
};
