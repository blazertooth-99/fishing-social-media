// lib/api/client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const SESSION_TOKEN_KEY = "fishing_session_token";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const localToken = localStorage.getItem(SESSION_TOKEN_KEY);
  if (localToken) return localToken;

  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)fishing_session=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return null;
}

export function getAuthHeaders(customHeaders: HeadersInit = {}): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = getSessionToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...customHeaders,
  };
}

export interface ApiFetchError {
  status?: number;
  data?: unknown;
  /** Milliseconds to wait before retrying (parsed from `Retry-After` on 429). */
  retryAfterMs?: number;
}

/**
 * Parse a `Retry-After` header value (seconds or HTTP date) to milliseconds.
 * Returns null when absent/unparseable.
 */
export function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 60_000);
  }
  const dateMs = Date.parse(trimmed);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, Math.min(dateMs - Date.now(), 60_000));
  }
  return null;
}

export function isRateLimitedError(err: unknown): boolean {
  return (err as { status?: number })?.status === 429;
}

export function getRetryAfterMs(err: unknown, fallbackMs: number): number {
  const hint = (err as { retryAfterMs?: unknown })?.retryAfterMs;
  if (typeof hint === "number" && Number.isFinite(hint) && hint >= 0) {
    return Math.min(hint, 60_000);
  }
  return fallbackMs;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,

    /**
     * Penting: sertakan cookie sekaligus header Authorization jika token tersedia.
     */
    credentials: "include",

    headers: getAuthHeaders({
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...options.headers,
    }),

    cache: "no-store",
  });

  let data: unknown = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    const thrown: ApiFetchError = {
      status: response.status,
      data,
    };
    // Surface rate-limit backoff hints so callers can retry instead of hammering.
    if (response.status === 429) {
      const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
      if (retryAfterMs !== null) thrown.retryAfterMs = retryAfterMs;
    }
    throw thrown;
  }

  return data as T;
}

export { API_BASE_URL };
