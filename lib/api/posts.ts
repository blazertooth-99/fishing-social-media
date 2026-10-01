// lib/api/posts.ts
// Posts + Feed API client.
// Verified against FRONTEND_API_GUIDE.md §15 (snake_case flat DTOs).

import { apiFetch, API_BASE_URL } from "./client";

export type PostPrivacy = "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";
export type LocationPrivacy = "EXACT" | "APPROXIMATE" | "PRIVATE";

export interface ApiPostMedia {
  id: string;
  display_url: string;
  thumbnail_url: string;
  width?: number | null;
  height?: number | null;
  [key: string]: unknown;
}

export interface ApiPostLocation {
  name?: string | null;
  privacy: LocationPrivacy | string;
  coordinates: { lat: number; lng: number } | null;
}

export interface ApiPost {
  id: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_media_id: string | null;
  content: string;
  privacy: PostPrivacy | string;
  location: ApiPostLocation | null;
  trip_id?: string | null;
  catch_id?: string | null;
  spot_id?: string | null;
  gear_id?: string | null;
  community_id?: string | null;
  place_id?: string | null;
  event_id?: string | null;
  is_promotional?: boolean;
  external_link_url?: string | null;
  external_link_title?: string | null;
  media: ApiPostMedia[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  content: string;
  media_ids: string[];
  latitude: number;
  longitude: number;
  location_name?: string | null;
  location_privacy?: LocationPrivacy;
  privacy?: PostPrivacy;
  trip_id?: string | null;
  catch_id?: string | null;
  spot_id?: string | null;
  gear_id?: string | null;
  community_id?: string | null;
  place_id?: string | null;
  event_id?: string | null;
  is_promotional?: boolean;
  external_link_url?: string | null;
  external_link_title?: string | null;
}

export interface Pagination {
  next_cursor: string | null;
  has_more: boolean;
  limit: number;
}

interface SingleEnvelope<T> {
  data: T;
}

interface CollectionEnvelope<T> {
  data: T[];
  pagination?: Pagination | null;
}

export interface ApiErrorDetails {
  field?: string;
  issue?: string;
  [key: string]: unknown;
}

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetails[];
  };
  message?: string;
}

function readErrorBody(err: unknown): { status?: number; body?: ApiErrorBody } {
  const thrown = err as { status?: number; data?: unknown };
  const body = (thrown?.data ?? undefined) as ApiErrorBody | undefined;
  const status = typeof thrown?.status === "number" ? thrown.status : undefined;
  if (body && typeof body === "object") return { status, body };
  // lib/api/media.ts legacy shape: plain Error with envelope attached
  const withPayload = err as Error & { payload?: unknown; status?: number };
  if (withPayload?.payload && typeof withPayload.payload === "object") {
    return {
      status: typeof withPayload.status === "number" ? withPayload.status : undefined,
      body: withPayload.payload as ApiErrorBody,
    };
  }
  return { status, body: undefined };
}

/**
 * All backend validation messages for a failed request.
 * Per FRONTEND_API_GUIDE §21, field-level `error.details` on 400/422 must be
 * shown — a single generic line hides which field the backend rejected.
 */
export function extractApiErrorMessages(err: unknown, fallback: string): string[] {
  const { status, body } = readErrorBody(err);
  const lines: string[] = [];

  const details = body?.error?.details;
  if (Array.isArray(details)) {
    for (const d of details) {
      const field = typeof d?.field === "string" ? d.field : "";
      const issue = typeof d?.issue === "string" ? d.issue : "";
      if (field && issue) lines.push(`${field}: ${issue}`);
      else if (issue) lines.push(issue);
      else if (field) lines.push(field);
    }
  }

  const msg = body?.error?.message || body?.message;
  if (msg) lines.push(msg);

  if (lines.length === 0) {
    if (err instanceof Error && err.message) lines.push(err.message);
    else lines.push(fallback);
  }

  if (status !== undefined && !lines.some((l) => l.includes(String(status)))) {
    lines.push(`HTTP ${status}`);
  }

  return lines;
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  return extractApiErrorMessages(err, fallback)[0] ?? fallback;
}

/**
 * Parse a coordinate text field. Accepts both dot and comma decimals
 * ("-6.2088", "-6,2088") and trims whitespace.
 */
export function parseCoordinate(
  raw: string,
  label: "latitude" | "longitude",
): { ok: true; value: number } | { ok: false; error: string } {
  const cleaned = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (cleaned === "") {
    return { ok: false, error: "Location is required for a post" };
  }
  const value = Number(cleaned);
  if (label === "latitude") {
    if (Number.isNaN(value) || value < -90 || value > 90) {
      return {
        ok: false,
        error: "Latitude must be a valid number between -90.0 and +90.0 degrees",
      };
    }
  } else {
    if (Number.isNaN(value) || value < -180 || value > 180) {
      return {
        ok: false,
        error: "Longitude must be a valid number between -180 and +180 degrees",
      };
    }
  }
  return { ok: true, value };
}

export interface CreatePostInput {
  content: string;
  mediaIds: string[];
  latitude: number;
  longitude: number;
  locationName?: string;
  locationPrivacy?: LocationPrivacy;
  privacy?: PostPrivacy;
}

/**
 * Build the minimal POST /api/v1/posts body matching the verified contract:
 * content + media_ids + latitude/longitude, optional location_name only when
 * non-empty (key omitted otherwise — never an explicit null/empty string).
 */
export function buildCreatePostPayload(input: CreatePostInput): CreatePostRequest {
  const name = (input.locationName ?? "").trim();
  return {
    content: input.content.trim(),
    media_ids: input.mediaIds,
    latitude: input.latitude,
    longitude: input.longitude,
    ...(name ? { location_name: name } : {}),
    location_privacy: input.locationPrivacy ?? "APPROXIMATE",
    privacy: input.privacy ?? "PUBLIC",
  };
}

/**
 * POST /api/v1/posts — caption + 1-10 photos + GPS are ALL required.
 * Response: 201 Created { data: PostResponse }
 */
export async function createPost(payload: CreatePostRequest): Promise<ApiPost> {
  const res = await apiFetch<SingleEnvelope<ApiPost>>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * PATCH /api/v1/posts/{id} — author only.
 * Only `content` (caption) and `privacy` are editable.
 * Photos and location cannot be changed after creation.
 * Response: 200 OK with the updated PostResponse.
 */
export interface UpdatePostRequest {
  content?: string;
  privacy?: PostPrivacy;
}

export async function updatePost(
  id: string,
  payload: UpdatePostRequest,
): Promise<ApiPost> {
  const res = await apiFetch<SingleEnvelope<ApiPost>>(
    `/posts/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return res.data;
}

/**
 * GET /api/v1/posts/{id} — single post detail.
 * Used after create/update to display the fresh post on /feed and /profile.
 */
export async function getPostById(id: string): Promise<ApiPost> {
  const res = await apiFetch<SingleEnvelope<ApiPost>>(
    `/posts/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
  return res.data;
}

/**
 * GET /api/v1/feed (alias /api/v1/posts/feed) — chronological social feed.
 */
export async function getFeed(opts?: {
  limit?: number;
  cursor?: string | null;
}): Promise<{ items: ApiPost[]; pagination: Pagination | null }> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 20));
  if (opts?.cursor) params.set("cursor", opts.cursor);

  const query = `?${params.toString()}`;
  // Primary path per docs: /feed. Fallback to alias /posts/feed.
  try {
    const res = await apiFetch<CollectionEnvelope<ApiPost>>(`/feed${query}`, {
      method: "GET",
    });
    return { items: res.data ?? [], pagination: res.pagination ?? null };
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      const res = await apiFetch<CollectionEnvelope<ApiPost>>(
        `/posts/feed${query}`,
        { method: "GET" },
      );
      return { items: res.data ?? [], pagination: res.pagination ?? null };
    }
    throw err;
  }
}

/**
 * Posts by a single user for the /profile Posts tab.
 *
 * There is no `GET /api/v1/users/{username}/posts` endpoint yet, so this
 * pages through `GET /api/v1/feed` (which always contains the viewer's own
 * posts, all privacies) and filters client-side by `author_id`.
 */
export async function getUserPosts(
  authorId: string,
  opts?: { limit?: number; maxPages?: number },
): Promise<ApiPost[]> {
  const limit = opts?.limit ?? 20;
  const maxPages = opts?.maxPages ?? 5;
  const mine: ApiPost[] = [];
  let cursor: string | null | undefined;
  const seen = new Set<string>();

  for (let page = 0; page < maxPages; page++) {
    const { items, pagination } = await getFeed({ limit, cursor });
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      if (item.author_id === authorId) mine.push(item);
    }
    const next = pagination?.next_cursor ?? null;
    const more = pagination?.has_more === true && Boolean(next);
    if (!more) break;
    cursor = next;
  }

  return mine;
}

/** Resolve backend-relative media URLs ("/api/v1/media/...") to absolute. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) {
    const origin = (API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");
    return `${origin}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
}

/** Short relative time for feed cards ("1h", "3d", ...). */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(iso).toLocaleDateString();
}
