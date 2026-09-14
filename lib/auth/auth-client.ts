"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export function loginWithGoogle() {
  if (typeof window === "undefined") return;

  const redirectTo = window.location.origin;

  const googleLoginUrl =
    `${API_BASE_URL}/auth/google` +
    `?redirect_to=${encodeURIComponent(redirectTo)}`;

  console.log("GOOGLE LOGIN URL:", googleLoginUrl);

  window.location.href = googleLoginUrl;
}

export async function getSession() {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  console.log("SESSION STATUS:", response.status);

  const result = await response.json();

  console.log("SESSION RESPONSE:", result);

  if (!response.ok) {
    if (response.status === 401) {
      return null;
    }

    throw new Error("Failed to fetch authentication session");
  }

  return result;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to logout");
  }

  return response.json();
}
