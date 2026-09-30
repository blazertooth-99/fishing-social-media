import { apiFetch, API_BASE_URL, getAuthHeaders } from "./client";

/**
 * ==============================
 * TYPES
 * ==============================
 */

export interface AuthSession {
  user_id: string;
  email: string;
}

export interface CurrentUser {
  user_id: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_media_id?: string;
  followers_count?: number;
  following_count?: number;
}

export interface SessionResponse {
  data: AuthSession;
}

export interface CurrentUserResponse {
  data: CurrentUser;
}

export interface LogoutResponse {
  data: {
    message: string;
  };
}

/**
 * ==============================
 * GOOGLE LOGIN
 * ==============================
 *
 * IMPORTANT:
 *
 * Jangan kirim redirect_to.
 *
 * Backend yang menentukan flow
 * OAuth-nya.
 */
export function loginWithGoogle() {
  if (typeof window === "undefined") {
    return;
  }

  const googleOAuthUrl = `${API_BASE_URL}/auth/google`;

  console.log("[AUTH] Google OAuth:", googleOAuthUrl);

  window.location.href = googleOAuthUrl;
}

/**
 * ==============================
 * GET SESSION
 * ==============================
 */

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getSession() {
  const url = `${API_BASE_URL}/auth/session`;

  console.log("=================================");
  console.log("GET SESSION");
  console.log("URL:", url);
  console.log("=================================");

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  const result = await response.json().catch(() => null);

  console.log("SESSION STATUS:", response.status);
  console.log("SESSION RESPONSE:", result);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string" ? result : JSON.stringify(result),
    );
  }

  return result;
}

/**
 * ==============================
 * GET CURRENT USER
 * ==============================
 */
export async function getCurrentUser() {
  return apiFetch<CurrentUserResponse>("/users/me", {
    method: "GET",
  });
}

/**
 * ==============================
 * LOGOUT
 * ==============================
 */
export async function logout() {
  try {
    return await apiFetch<LogoutResponse>("/auth/logout", {
      method: "POST",
    });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fishing_session_token");
    }
  }
}
