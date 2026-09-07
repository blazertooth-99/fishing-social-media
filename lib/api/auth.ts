import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  username?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: AuthUser;
}

export async function getSession() {
  return apiClient<SessionResponse>("/api/v1/auth/session", {
    method: "GET",
  });
}

export async function logout() {
  return apiClient("/api/v1/auth/logout", {
    method: "POST",
  });
}
