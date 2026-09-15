import { apiFetch, API_BASE_URL } from "./client";

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
export async function getSession() {
  return apiFetch<SessionResponse>("/auth/session", {
    method: "GET",
  });
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
  return apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}
