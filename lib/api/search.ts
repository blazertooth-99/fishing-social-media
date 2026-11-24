import { API_BASE_URL, apiFetch } from "./client";
import { extractApiErrorMessage } from "./posts";

export interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_media_id: string | null;
  bio?: string | null;
}

export interface SearchPostAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_media_id: string | null;
  bio?: string | null;
}

export interface SearchPost {
  id: string;
  author: SearchPostAuthor;
  content_snippet: string;
  media_thumbnail_id: string | null;
  created_at: string;
}

export interface SearchCommunity {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  avatar_media_id: string | null;
  member_count?: number | null;
}

export interface SearchSpot {
  id: string;
  name: string;
  water_type: string;
  location_privacy: string;
  coordinates: { latitude: number; longitude: number } | null;
  rating_average: number | null;
  review_count: number;
  distance_meters: number | null;
}

export interface SearchPlace {
  id: string;
  name: string;
  address: string;
  water_type: string;
  facilities: unknown;
  is_verified: boolean;
  rating_average: number | null;
  review_count: number;
  distance_meters: number | null;
}

export interface SearchSpecies {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  water_type: string;
  photo_url: string | null;
}

export interface SearchGear {
  gear_type: string;
  brand: string;
  model: string;
  specs: unknown;
}

export interface SearchEvent {
  id: string;
  title: string;
  description_snippet: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  location_name: string | null;
  external_registration_url: string | null;
  community_id: string | null;
  place_id: string | null;
}

export interface SearchHashtag {
  tag: string;
  post_count: number;
}

export interface UnifiedSearchResults {
  users: SearchUser[];
  posts: SearchPost[];
  communities: SearchCommunity[];
  spots: SearchSpot[];
  places: SearchPlace[];
  species: SearchSpecies[];
  gear: SearchGear[];
  events: SearchEvent[];
  hashtags: SearchHashtag[];
}

export const EMPTY_SEARCH_RESULTS: UnifiedSearchResults = {
  users: [],
  posts: [],
  communities: [],
  spots: [],
  places: [],
  species: [],
  gear: [],
  events: [],
  hashtags: [],
};

export function getSearchMediaThumbnailUrl(
  mediaThumbnailId: string | null | undefined,
): string | null {
  if (!mediaThumbnailId) return null;
  return `${API_BASE_URL}/media/${mediaThumbnailId}/thumbnail`;
}

export function extractSearchErrorMessage(
  err: unknown,
  fallback: string,
): string {
  return extractApiErrorMessage(err, fallback);
}

function normalizeResults(
  data: Partial<UnifiedSearchResults> | null | undefined,
): UnifiedSearchResults {
  if (!data) return EMPTY_SEARCH_RESULTS;
  return {
    users: Array.isArray(data.users) ? data.users : [],
    posts: Array.isArray(data.posts) ? data.posts : [],
    communities: Array.isArray(data.communities) ? data.communities : [],
    spots: Array.isArray(data.spots) ? data.spots : [],
    places: Array.isArray(data.places) ? data.places : [],
    species: Array.isArray(data.species) ? data.species : [],
    gear: Array.isArray(data.gear) ? data.gear : [],
    events: Array.isArray(data.events) ? data.events : [],
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
  };
}

export async function unifiedSearch(
  query: string,
  opts?: { limit?: number },
): Promise<UnifiedSearchResults> {
  const q = query.trim();
  if (!q) return EMPTY_SEARCH_RESULTS;

  const params = new URLSearchParams({ q });
  if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
  const suffix = `?${params.toString()}`;

  try {
    const res = await apiFetch<{ data?: Partial<UnifiedSearchResults> }>(
      `/discovery/search${suffix}`,
      { method: "GET" },
    );
    return normalizeResults(res.data);
  } catch (err) {
    if ((err as { status?: number })?.status === 404) {
      const res = await apiFetch<{ data?: Partial<UnifiedSearchResults> }>(
        `/search${suffix}`,
        { method: "GET" },
      );
      return normalizeResults(res.data);
    }
    throw err;
  }
}
