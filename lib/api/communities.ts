// lib/api/communities.ts
// Communities API client.
// Verified against .agentv1/documentation/FRONTEND_API_GUIDE.md §15 (Communities)
// plus live shape checks: GET /communities -> { data: CommunityListItem[] },
// GET /communities/{id_or_slug} -> { data: CommunityDetail }.

import { apiFetch } from "./client";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";

export interface ApiCommunity {
  id: string;
  creator_id?: string | null;
  name: string;
  slug: string;
  description: string | null;
  visibility: CommunityVisibility | string;
  avatar_media_id: string | null;
  created_at?: string | null;
  member_count: number;
  event_count?: number | null;
  post_count?: number | null;
  is_member?: boolean | null;
  my_role?: string | null;
  [key: string]: unknown;
}

export interface CreateCommunityRequest {
  name: string;
  slug?: string;
  description?: string | null;
  visibility: CommunityVisibility;
  avatar_media_id?: string | null;
}

export interface CreateCommunityInput {
  name: string;
  slug?: string;
  description?: string;
  visibility?: CommunityVisibility;
  avatarMediaId?: string | null;
}

interface SingleEnvelope<T> {
  data: T;
}

interface CollectionEnvelope<T> {
  data: T[];
  pagination?: {
    next_cursor?: string | null;
    has_more?: boolean;
    limit?: number;
  } | null;
}

/**
 * Turn "Bay Area Kayak Anglers!" -> "bay-area-kayak-anglers".
 * Backend accepts an explicit slug; when the user leaves it blank we
 * generate one client-side so the created card shows a clean URL part.
 */
export function slugifyCommunityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

export function isValidCommunitySlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}

export function buildCreateCommunityPayload(
  input: CreateCommunityInput,
): CreateCommunityRequest {
  const name = input.name.trim();
  const rawSlug = (input.slug ?? "").trim().toLowerCase();
  const slug = rawSlug || slugifyCommunityName(name);
  const description = (input.description ?? "").trim();

  return {
    name,
    slug,
    ...(description ? { description } : { description: null }),
    visibility: input.visibility ?? "PUBLIC",
    ...(input.avatarMediaId ? { avatar_media_id: input.avatarMediaId } : { avatar_media_id: null }),
  };
}

/**
 * POST /api/v1/communities — Auth required.
 * Response: 201 Created { data: CommunityDetailResponse }
 */
export async function createCommunity(
  payload: CreateCommunityRequest,
): Promise<ApiCommunity> {
  const res = await apiFetch<SingleEnvelope<ApiCommunity>>("/communities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * GET /api/v1/communities?limit=&cursor=
 * Live backend returns a plain array envelope { data: [...] } (no pagination
 * object). Accept both shapes so a future paginated backend keeps working.
 */
export async function listCommunities(opts?: {
  limit?: number;
  cursor?: string | null;
}): Promise<{ items: ApiCommunity[]; nextCursor: string | null; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 20));
  if (opts?.cursor) params.set("cursor", opts.cursor);

  const res = await apiFetch<CollectionEnvelope<ApiCommunity> | ApiCommunity[]>(
    `/communities?${params.toString()}`,
    { method: "GET" },
  );

  if (Array.isArray(res)) {
    return { items: res, nextCursor: null, hasMore: false };
  }
  return {
    items: res.data ?? [],
    nextCursor: res.pagination?.next_cursor ?? null,
    hasMore: res.pagination?.has_more === true && Boolean(res.pagination?.next_cursor),
  };
}

/**
 * GET /api/v1/communities/{id_or_slug} — single community detail.
 * Used after create to display the fresh community on /community.
 */
export async function getCommunityByIdOrSlug(idOrSlug: string): Promise<ApiCommunity> {
  const res = await apiFetch<SingleEnvelope<ApiCommunity>>(
    `/communities/${encodeURIComponent(idOrSlug)}`,
    { method: "GET" },
  );
  return res.data;
}

/**
 * POST /api/v1/communities/{id_or_slug}/join — Auth required.
 * Response: 201 Created.
 */
export async function joinCommunity(idOrSlug: string): Promise<void> {
  await apiFetch(`/communities/${encodeURIComponent(idOrSlug)}/join`, {
    method: "POST",
  });
}

/**
 * POST /api/v1/communities/{id_or_slug}/leave — Auth required.
 * Response: 200 OK { data: null }.
 */
export async function leaveCommunity(idOrSlug: string): Promise<void> {
  await apiFetch(`/communities/${encodeURIComponent(idOrSlug)}/leave`, {
    method: "POST",
  });
}

export type CommunityMemberRole =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER";

export interface ApiCommunityMember {
  community_id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_media_id: string | null;
  role: CommunityMemberRole | string;
  joined_at: string;
  [key: string]: unknown;
}

/**
 * GET /api/v1/communities/{id_or_slug}/members?limit=20 — Auth optional.
 * Limit only (default 20, max 100), no cursor. Plain array envelope.
 */
export async function listCommunityMembers(
  idOrSlug: string,
  opts?: { limit?: number },
): Promise<ApiCommunityMember[]> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 20));

  const res = await apiFetch<CollectionEnvelope<ApiCommunityMember>>(
    `/communities/${encodeURIComponent(idOrSlug)}/members?${params.toString()}`,
    { method: "GET" },
  );
  return res.data ?? [];
}

export interface ApiCommunityPostMedia {
  id: string;
  display_url: string;
  thumbnail_url: string;
  width?: number | null;
  height?: number | null;
  [key: string]: unknown;
}

export interface ApiCommunityPost {
  id: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_media_id: string | null;
  content: string;
  privacy: string;
  location: {
    name?: string | null;
    privacy: string;
    coordinates: { lat: number; lng: number } | null;
  } | null;
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
  media: ApiCommunityPostMedia[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * GET /api/v1/communities/{id_or_slug}/posts — community timeline.
 * Accepts both plain-array and paginated envelopes.
 */
export async function listCommunityPosts(
  idOrSlug: string,
  opts?: { limit?: number; cursor?: string | null },
): Promise<{ items: ApiCommunityPost[]; nextCursor: string | null; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 20));
  if (opts?.cursor) params.set("cursor", opts.cursor);

  const res = await apiFetch<CollectionEnvelope<ApiCommunityPost> | ApiCommunityPost[]>(
    `/communities/${encodeURIComponent(idOrSlug)}/posts?${params.toString()}`,
    { method: "GET" },
  );

  if (Array.isArray(res)) {
    return { items: res, nextCursor: null, hasMore: false };
  }
  return {
    items: res.data ?? [],
    nextCursor: res.pagination?.next_cursor ?? null,
    hasMore: res.pagination?.has_more === true && Boolean(res.pagination?.next_cursor),
  };
}

/**
 * POST /api/v1/communities/{id_or_slug}/posts — members only.
 * Unlike main posts, community posts are text-first: content is the primary
 * field (photo/location optional). Response: 201 Created { data: Post }.
 */
export async function createCommunityPost(
  idOrSlug: string,
  payload: { content: string },
): Promise<ApiCommunityPost> {
  const res = await apiFetch<SingleEnvelope<ApiCommunityPost>>(
    `/communities/${encodeURIComponent(idOrSlug)}/posts`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
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
  if (thrown && typeof thrown === "object" && "status" in thrown) {
    const body = (thrown.data ?? undefined) as ApiErrorBody | undefined;
    const status = typeof thrown.status === "number" ? thrown.status : undefined;
    if (body && typeof body === "object") return { status, body };
    return { status, body: undefined };
  }
  return { status: undefined, body: undefined };
}

/**
 * All backend validation messages for a failed request.
 * Field-level `error.details` on 400/422 must be shown per guide §21.
 */
export function extractCommunityErrorMessages(err: unknown, fallback: string): string[] {
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

  if (status === 401 && !lines.some((l) => l.toLowerCase().includes("login"))) {
    lines.push("Please log in to continue.");
  }

  return lines;
}

export function extractCommunityErrorMessage(err: unknown, fallback: string): string {
  return extractCommunityErrorMessages(err, fallback)[0] ?? fallback;
}
