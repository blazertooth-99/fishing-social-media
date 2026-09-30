// lib/api/media.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export interface MediaUploadResponse {
  id: string;
  display_url?: string;
  thumbnail_url?: string;
  [key: string]: unknown;
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
    body: formData,
  });

  const result = await response.json().catch(() => null);

  console.log("MEDIA UPLOAD STATUS:", response.status);
  console.log("MEDIA UPLOAD RESPONSE:", result);

  if (!response.ok) {
    throw new Error(
      result?.message ??
        result?.error ??
        `Failed to upload media: ${response.status}`,
    );
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
