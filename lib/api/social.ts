// lib/api/social.ts
// Social graph API client.
// Verified against .agentv1/documentation/FRONTEND_API_GUIDE.md
// (Social Graph: followers/following lists — limit only, no cursor).

import { apiFetch } from "./client";

export interface ApiFollowUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar_media_id: string | null;
  [key: string]: unknown;
}

interface CollectionEnvelope<T> {
  data: T[];
}

/**
 * GET /api/v1/users/{username}/followers?limit=20 — Auth optional.
 * Limit only (default 20, max 100), no cursor. Plain array envelope.
 */
export async function listFollowers(
  username: string,
  opts?: { limit?: number },
): Promise<ApiFollowUser[]> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 50));

  const res = await apiFetch<CollectionEnvelope<ApiFollowUser>>(
    `/users/${encodeURIComponent(username)}/followers?${params.toString()}`,
    { method: "GET" },
  );
  return res.data ?? [];
}

/**
 * GET /api/v1/users/{username}/following?limit=20 — Auth optional.
 * Same shape as followers.
 */
export async function listFollowing(
  username: string,
  opts?: { limit?: number },
): Promise<ApiFollowUser[]> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 50));

  const res = await apiFetch<CollectionEnvelope<ApiFollowUser>>(
    `/users/${encodeURIComponent(username)}/following?${params.toString()}`,
    { method: "GET" },
  );
  return res.data ?? [];
}

export function extractSocialErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const thrown = err as {
    status?: number;
    data?: {
      error?: { message?: string };
      message?: string;
    };
  };
  const msg =
    thrown?.data?.error?.message || thrown?.data?.message || fallback;
  if (thrown?.status === 401) return "Please log in to continue.";
  return msg;
}
