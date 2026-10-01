// lib/api/media.ts

import { getAuthHeaders, API_BASE_URL } from "./client";

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export interface MediaUploadResponse {
  /** Backend returns `media_id` (see live response); keep `id` as fallback. */
  media_id: string;
  id?: string;
  display_url?: string;
  thumbnail_url?: string;
  width?: number | null;
  height?: number | null;
  [key: string]: unknown;
}

/** Resolve the media identifier regardless of backend field naming. */
export function resolveMediaId(uploaded: MediaUploadResponse): string | null {
  const raw = uploaded?.media_id ?? uploaded?.id;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

/**
 * POST /api/v1/media/upload
 */
export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await response.json().catch(() => null);

  console.log("MEDIA UPLOAD STATUS:", response.status);
  console.log("MEDIA UPLOAD RESPONSE:", result);

  if (!response.ok) {
    // Throw structured { status, data } (same shape as apiFetch) so callers
    // can surface backend `error.details` (e.g. 422 validation) instead of
    // "[object Object]".
    throw {
      status: response.status,
      data: result,
    };
  }

  if (!result?.data) {
    throw new Error("Invalid media upload response.");
  }

  return result.data;
}

/**
 * Profile avatar thumbnail URL
 */
export function getAvatarUrl(avatarMediaId: string | null): string | null {
  if (!avatarMediaId) {
    return null;
  }

  return `${API_BASE_URL}/media/${avatarMediaId}/thumbnail`;
}
