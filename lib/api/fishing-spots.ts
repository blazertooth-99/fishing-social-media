// lib/api/fishing-spots.ts
// Fishing Spots (Natural Waters) API client.
// Verified against .agentv1/documentation/FRONTEND_API_GUIDE.md §15
// "Fishing Spots (Natural Waters)" + "Reviews" + "Search & Discovery",
// plus live shape checks (2026-10-06):
//   GET /locations/spots?lat=&lng=&limit=      -> { data: FishingSpotMapItem[] }
//   GET /locations/spots/bounds?bbox=...        -> { data: FishingSpotMapItem[] }
//   GET /locations/spots/nearby?lat&lng&radius  -> { data: FishingSpotMapItem[] }
//   GET /locations/spots/{id}                   -> { data: FishingSpotDetail }
//   GET /locations/spots/{id}/reviews           -> { data: SpotReview[] }
//   GET /discovery/spots?q=                     -> { data: DiscoverySpotItem[] }

import { apiFetch } from "./client";

export type SpotWaterType = "FRESHWATER" | "SALTWATER" | "BRACKISH" | string;
export type SpotPrivacy = "EXACT" | "APPROXIMATE" | "PRIVATE" | string;

/** Item returned by /locations/spots, /bounds, /nearby (FishingSpotMapItem). */
export interface ApiFishingSpot {
  id: string;
  name: string;
  water_type: SpotWaterType;
  /** Flat coordinates — always `lat`/`lng` on these endpoints. */
  lat: number;
  lng: number;
  distance_meters?: number | null;
  average_rating?: number | null;
  review_count?: number | null;
  privacy: SpotPrivacy;
  [key: string]: unknown;
}

/** Detail returned by GET /locations/spots/{id}. */
export interface ApiFishingSpotDetail {
  id: string;
  creator_id?: string | null;
  creator_username?: string | null;
  creator_display_name?: string | null;
  name: string;
  description: string | null;
  coordinates: { lat: number; lng: number } | null;
  water_type: SpotWaterType;
  privacy: SpotPrivacy;
  created_at?: string | null;
  average_rating: number | null;
  review_count: number;
  [key: string]: unknown;
}

export interface CreateFishingSpotRequest {
  name: string;
  description?: string | null;
  lat: number;
  lng: number;
  water_type: SpotWaterType;
  privacy: SpotPrivacy;
}

export interface CreateFishingSpotInput {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  waterType?: SpotWaterType;
  privacy?: SpotPrivacy;
}

export interface ApiSpotReview {
  id: string;
  spot_id?: string | null;
  author_id?: string | null;
  author_username?: string | null;
  author_display_name?: string | null;
  rating: number;
  content?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface CreateSpotReviewRequest {
  rating: number;
  content?: string | null;
}

/** Item returned by GET /discovery/spots?q= (note different field names). */
export interface ApiDiscoverySpot {
  id: string;
  name: string;
  water_type: SpotWaterType;
  location_privacy: SpotPrivacy;
  coordinates: { latitude: number; longitude: number } | null;
  rating_average: number | null;
  review_count: number;
  distance_meters: number | null;
  [key: string]: unknown;
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

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * GET /api/v1/locations/spots — spatial query.
 * Requires either `bbox` (min_lng,min_lat,max_lng,max_lat) OR `lat`+`lng`.
 * Optional: `radius` (meters, 1..100000 — only for /nearby; plain /spots
 * accepts `radius_km` per curl collection), `water_type`, `privacy`, `limit`.
 * Response: 200 OK { data: FishingSpotMapItem[] } (plain array envelope).
 */
export async function listSpots(opts: {
  bbox?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  waterType?: SpotWaterType;
  privacy?: SpotPrivacy;
  limit?: number;
}): Promise<ApiFishingSpot[]> {
  const query = toQuery({
    ...(opts.bbox ? { bbox: opts.bbox } : {}),
    ...(opts.lat !== undefined ? { lat: opts.lat } : {}),
    ...(opts.lng !== undefined ? { lng: opts.lng } : {}),
    ...(opts.radiusKm !== undefined ? { radius_km: opts.radiusKm } : {}),
    ...(opts.waterType ? { water_type: opts.waterType } : {}),
    ...(opts.privacy ? { privacy: opts.privacy } : {}),
    limit: opts.limit ?? 20,
  });

  const res = await apiFetch<CollectionEnvelope<ApiFishingSpot> | ApiFishingSpot[]>(
    `/locations/spots${query}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/**
 * GET /api/v1/locations/spots/bounds?bbox=min_lng,min_lat,max_lng,max_lat
 * Auth: optional. Used for map viewport queries.
 */
export async function querySpotsBounds(
  bbox: string,
  opts?: { limit?: number },
): Promise<ApiFishingSpot[]> {
  const query = toQuery({ bbox, limit: opts?.limit ?? 50 });
  const res = await apiFetch<CollectionEnvelope<ApiFishingSpot> | ApiFishingSpot[]>(
    `/locations/spots/bounds${query}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/**
 * GET /api/v1/locations/spots/nearby?lat=&lng=&radius=&limit=
 * Auth: optional. `radius` in meters (NOT `radius_meters`), 1..100000.
 */
export async function querySpotsNearby(opts: {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}): Promise<ApiFishingSpot[]> {
  const query = toQuery({
    lat: opts.lat,
    lng: opts.lng,
    radius: opts.radius ?? 10000,
    limit: opts.limit ?? 20,
  });
  const res = await apiFetch<CollectionEnvelope<ApiFishingSpot> | ApiFishingSpot[]>(
    `/locations/spots/nearby${query}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/**
 * GET /api/v1/locations/spots/{id} — spot detail (with description,
 * coordinates object, average_rating + review_count).
 * Auth: optional.
 */
export async function getSpotDetail(id: string): Promise<ApiFishingSpotDetail> {
  const res = await apiFetch<SingleEnvelope<ApiFishingSpotDetail>>(
    `/locations/spots/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
  return res.data;
}

/**
 * POST /api/v1/locations/spots — Auth required.
 * Body uses flat `lat`/`lng` (NOT latitude/longitude).
 * Response: 201 Created { data: FishingSpotResponse }
 */
export function buildCreateSpotPayload(input: CreateFishingSpotInput): CreateFishingSpotRequest {
  const name = input.name.trim();
  const description = (input.description ?? "").trim();
  return {
    name,
    ...(description ? { description } : { description: null }),
    lat: input.lat,
    lng: input.lng,
    water_type: input.waterType ?? "FRESHWATER",
    privacy: input.privacy ?? "APPROXIMATE",
  };
}

export async function createSpot(
  payload: CreateFishingSpotRequest,
): Promise<ApiFishingSpotDetail> {
  const res = await apiFetch<SingleEnvelope<ApiFishingSpotDetail>>(
    "/locations/spots",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

/**
 * GET /api/v1/locations/spots/{id}/reviews — Auth optional.
 */
export async function listSpotReviews(spotId: string): Promise<ApiSpotReview[]> {
  const res = await apiFetch<CollectionEnvelope<ApiSpotReview> | ApiSpotReview[]>(
    `/locations/spots/${encodeURIComponent(spotId)}/reviews`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/**
 * POST /api/v1/locations/spots/{id}/reviews — Auth required.
 * Response: 201 Created.
 */
export async function createSpotReview(
  spotId: string,
  payload: CreateSpotReviewRequest,
): Promise<ApiSpotReview> {
  const res = await apiFetch<SingleEnvelope<ApiSpotReview>>(
    `/locations/spots/${encodeURIComponent(spotId)}/reviews`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

/**
 * GET /api/v1/discovery/spots?q= — trigram full-text spot search.
 * Auth: optional. Returns DiscoverySpotItem shape
 * (location_privacy + coordinates{latitude,longitude} + rating_average).
 */
export async function searchSpots(query: string): Promise<ApiDiscoverySpot[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await apiFetch<CollectionEnvelope<ApiDiscoverySpot> | ApiDiscoverySpot[]>(
    `/discovery/spots${toQuery({ q })}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/** Normalize a DiscoverySpotItem to the flat map-item shape used by cards. */
export function discoverySpotToMapItem(spot: ApiDiscoverySpot): ApiFishingSpot {
  return {
    id: spot.id,
    name: spot.name,
    water_type: spot.water_type,
    lat: spot.coordinates?.latitude ?? 0,
    lng: spot.coordinates?.longitude ?? 0,
    distance_meters: spot.distance_meters ?? null,
    average_rating: spot.rating_average ?? null,
    review_count: spot.review_count ?? null,
    privacy: spot.location_privacy,
  };
}

/** "850 m" / "1.2 km" / "-" when unknown. */
export function formatSpotDistance(distanceMeters: number | null | undefined): string {
  if (distanceMeters === null || distanceMeters === undefined) return "-";
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return "-";
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

/** "4.8" / "New" when no rating yet. */
export function formatSpotRating(
  averageRating: number | null | undefined,
  reviewCount?: number | null,
): string {
  if (typeof averageRating === "number" && Number.isFinite(averageRating)) {
    return averageRating.toFixed(1);
  }
  if (typeof reviewCount === "number" && reviewCount > 0) return "-";
  return "New";
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

/** Field-level backend messages for 400/422 per guide §21. */
export function extractSpotErrorMessages(err: unknown, fallback: string): string[] {
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

export function extractSpotErrorMessage(err: unknown, fallback: string): string {
  return extractSpotErrorMessages(err, fallback)[0] ?? fallback;
}
