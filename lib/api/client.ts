const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,

    /**
     * Sangat penting.
     *
     * Backend menggunakan session cookie.
     */
    credentials: "include",

    headers: {
      Accept: "application/json",

      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...options.headers,
    },

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
