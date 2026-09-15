const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-fishing.janissaryid.com/api/v1";

const SESSION_TOKEN_KEY = "fishing_session_token";

class ApiService {
  private apiBase: string;

  constructor() {
    this.apiBase = API_URL;
  }

  getApiBase() {
    return this.apiBase;
  }

  setSessionToken(token: string | null) {
    if (typeof window === "undefined") return;

    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  }

  getSessionToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(SESSION_TOKEN_KEY);
  }

  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    const token = this.getSessionToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return {
      ...headers,
      ...customHeaders,
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.apiBase}${endpoint}`;

    const response = await fetch(url, {
      ...options,

      // Penting kalau backend menggunakan cookie session
      credentials: "include",

      headers: this.getHeaders(options.headers),
    });

    const contentType = response.headers.get("content-type");

    let data: unknown = null;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;

      const error = new ApiError(
        errorData?.error?.message ||
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data,
      );

      throw error;
    }

    return data as T;
  }

  async verifyGoogleIdToken(idToken: string) {
    const response = await this.request<ApiResponse<VerifyGoogleData>>(
      "/auth/google/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: idToken,
        }),
      },
    );

    if (response?.data?.session_token) {
      this.setSessionToken(response.data.session_token);
    }

    return response;
  }

  async getSession() {
    try {
      return await this.request<ApiResponse<SessionData>>("/auth/session", {
        method: "GET",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }

      throw error;
    }
  }

  async getCurrentUserProfile() {
    return this.request<ApiResponse<User>>("/users/me", {
      method: "GET",
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } finally {
      this.setSessionToken(null);
    }
  }

  async checkHealth() {
    const response = await fetch(
      `${this.apiBase.replace("/api/v1", "")}/health/ready`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response.json();
  }
}

export interface VerifyGoogleData {
  session_token: string;
  user_id: string;
  email: string;
}

export interface ApiErrorResponse {
  error?: {
    message?: string;
  };
  message?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiService();
