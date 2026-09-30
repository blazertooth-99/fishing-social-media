// lib/api/profile.ts

import { getAuthHeaders, API_BASE_URL } from "./client";

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

// ======================================================
// TYPES
// ======================================================

export type ProfileRelationship = "SELF" | "FOLLOWING" | "NOT_FOLLOWING";

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_media_id: string | null;
  followers_count: number;
  following_count: number;
  relationship: ProfileRelationship;
}

export interface UpdateProfilePayload {
  display_name: string;
  bio: string;
  avatar_media_id?: string | null;
}

// ======================================================
// ERROR HELPER
// ======================================================

function getApiErrorMessage(result: unknown, status: number): string {
  // String langsung
  if (typeof result === "string") {
    return result;
  }

  // Bukan object
  if (typeof result !== "object" || result === null) {
    return `Request failed with status ${status}`;
  }

  const data = result as Record<string, unknown>;

  // message
  if (typeof data.message === "string") {
    return data.message;
  }

  // error
  if (typeof data.error === "string") {
    return data.error;
  }

  // detail
  if (typeof data.detail === "string") {
    return data.detail;
  }

  // errors
  if (typeof data.errors === "string") {
    return data.errors;
  }

  // Jika backend mengembalikan object,
  // tampilkan JSON-nya agar mudah debugging.
  if (data.errors && typeof data.errors === "object") {
    return JSON.stringify(data.errors);
  }

  return JSON.stringify(result);
}

// ======================================================
// GET MY PROFILE
// ======================================================

export async function getMyProfile(): Promise<UserProfile> {
  const url = `${API_BASE_URL}/users/me`;

  console.log("=================================");
  console.log("GET MY PROFILE");
  console.log("URL:", url);
  console.log("=================================");

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  const result: unknown = await response.json().catch(() => null);

  console.log("PROFILE STATUS:", response.status);
  console.log("PROFILE RESPONSE:", result);

  if (!response.ok) {
    const message = getApiErrorMessage(result, response.status);

    console.error("PROFILE API ERROR:", message);

    throw new Error(message);
  }

  if (typeof result !== "object" || result === null) {
    throw new Error("Invalid profile response from API.");
  }

  const data = (
    result as {
      data?: UserProfile;
    }
  ).data;

  if (!data) {
    console.error("PROFILE RESPONSE DOES NOT CONTAIN DATA:", result);

    throw new Error("Profile data is missing from API response.");
  }

  return data;
}

// ======================================================
// UPDATE MY PROFILE
// ======================================================

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const url = `${API_BASE_URL}/users/me`;

  console.log("=================================");
  console.log("UPDATE MY PROFILE");
  console.log("URL:", url);
  console.log("PAYLOAD:", payload);
  console.log("=================================");

  const response = await fetch(url, {
    method: "PATCH",

    credentials: "include",

    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),

    body: JSON.stringify(payload),
  });

  const result: unknown = await response.json().catch(() => null);

  console.log("UPDATE PROFILE STATUS:", response.status);

  console.log("UPDATE PROFILE RESPONSE:", result);

  if (!response.ok) {
    const message = getApiErrorMessage(result, response.status);

    console.error("UPDATE PROFILE API ERROR:", message);

    throw new Error(message);
  }

  if (typeof result !== "object" || result === null) {
    throw new Error("Invalid updated profile response.");
  }

  const data = (
    result as {
      data?: UserProfile;
    }
  ).data;

  if (!data) {
    throw new Error("Updated profile data is missing from API response.");
  }

  return data;
}
