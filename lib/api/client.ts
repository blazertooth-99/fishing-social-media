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
    throw {
      status: response.status,
      data,
    };
  }

  return data as T;
}

export { API_BASE_URL };
