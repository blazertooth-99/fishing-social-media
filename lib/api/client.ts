const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-fishing.janissaryid.com";

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Accept", "application/json");

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,

    // penting untuk session cookie
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();

      message = error.message || error.error || message;
    } catch {
      // response bukan JSON
    }

    throw new Error(message);
  }

  return response.json();
}
