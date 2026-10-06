// lib/api/session.ts
// Shared, cached viewer-session loader.
//
// Problem it solves: every page mounts several components that each called
// `GET /auth/session` independently (AuthProvider + feed + sidebar +
// community lists), and React StrictMode double-invokes effects in dev.
// That burst trips the backend rate limiter (429 Too Many Requests) and the
// session then "fails to be obtained".
//
// Scheme:
// - Module-level cache: fresh entries are reused (default 60s, 15s for null).
// - In-flight deduplication: N concurrent callers share ONE HTTP request.
// - 429 retry: up to 3 attempts with backoff honoring the server's
//   `Retry-After` header; if a stale entry exists it is returned instead of
//   throwing, so the UI keeps working through a rate-limit window.

import {
  apiFetch,
  getRetryAfterMs,
  isRateLimitedError,
} from "@/lib/api/client";

export interface CachedSessionData {
  user_id: string;
  email: string;
}

export interface CachedSessionResponse {
  data: CachedSessionData;
}

const SUCCESS_TTL_MS = 60_000;
const NULL_TTL_MS = 15_000;
const MAX_ATTEMPTS = 3;

interface CacheEntry {
  value: CachedSessionResponse | null;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<CachedSessionResponse | null> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms: number): number {
  return ms + Math.floor(Math.random() * 250);
}

async function fetchSessionOnce(): Promise<CachedSessionResponse | null> {
  try {
    const res = await apiFetch<CachedSessionResponse>("/auth/session", {
      method: "GET",
    });
    if (!res?.data?.user_id) return null;
    return res;
  } catch (err) {
    if ((err as { status?: number })?.status === 401) return null;
    throw err;
  }
}

async function fetchSessionWithRetry(
  stale: CachedSessionResponse | null | undefined,
): Promise<CachedSessionResponse | null> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchSessionOnce();
    } catch (err) {
      lastError = err;
      if (!isRateLimitedError(err) || attempt === MAX_ATTEMPTS) break;
      // Back off: server hint first, else exponential 1s / 2s.
      const backoff = getRetryAfterMs(err, 1000 * 2 ** (attempt - 1));
      await sleep(Math.min(jitter(backoff), 10_000));
    }
  }
  // Rate-limited with no fresh answer: serve stale instead of failing,
  // so the app keeps working through the limit window.
  if (stale !== undefined && stale !== null) return stale;
  throw lastError;
}

/**
 * Cached `GET /auth/session`. Safe to call from any number of components —
 * concurrent calls share one request and fresh results are reused.
 */
export async function getCachedSession(opts?: {
  ttlMs?: number;
}): Promise<CachedSessionResponse | null> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;
  if (inFlight) return inFlight;

  const stale = cache?.value ?? null;
  inFlight = fetchSessionWithRetry(stale)
    .then((value) => {
      const ttl = value ? (opts?.ttlMs ?? SUCCESS_TTL_MS) : NULL_TTL_MS;
      cache = { value, expiresAt: Date.now() + ttl };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Drop the cached session — call after login / logout / account deletion. */
export function invalidateSessionCache(): void {
  cache = null;
}
