"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3067/api/v1";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Login dibatalkan oleh pengguna.",
  missing_code: "Login gagal: Kode otorisasi tidak ditemukan.",
  missing_state: "Login gagal: State otorisasi tidak valid.",
  unauthorized: "Sesi login tidak valid atau telah kadaluwarsa.",
  forbidden: "Akun Anda tidak aktif atau ditangguhkan.",
  invalid_request: "Permintaan otorisasi tidak valid.",
  server_error: "Terjadi gangguan pada server. Silakan coba lagi.",
  redirect_unallowed:
    "URL redirect_to belum terdaftar di ALLOWED_FRONTEND_REDIRECTS.",
};

interface User {
  user_id: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_media_id?: string;
  followers_count?: number;
  following_count?: number;
}

interface Session {
  user_id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;

  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Check apakah user mempunyai session valid.
   *
   * Backend harus membaca:
   * fishing_session
   *
   * dari HttpOnly Cookie.
   */
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);

      const sessionResponse = await fetch(`${API_BASE_URL}/auth/session`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!sessionResponse.ok) {
        setSession(null);
        setUser(null);
        return;
      }

      const sessionJson = await sessionResponse.json();

      const currentSession = sessionJson?.data;

      if (!currentSession?.user_id) {
        setSession(null);
        setUser(null);
        return;
      }

      setSession(currentSession);

      /**
       * Setelah session valid,
       * ambil profile user.
       */
      const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (userResponse.ok) {
        const userJson = await userResponse.json();

        setUser(userJson?.data ?? userJson);
      } else {
        /**
         * Session ada tetapi profile gagal.
         * Session tetap dianggap valid.
         */
        setUser({
          user_id: currentSession.user_id,
          email: currentSession.email,
        });
      }
    } catch (error) {
      console.error("Failed to check authentication session:", error);

      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle OAuth callback error.
   *
   * Contoh:
   * http://localhost:3000/login?auth_error=access_denied
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const error = params.get("auth_error");

    if (error) {
      setAuthError(AUTH_ERROR_MESSAGES[error] || `Otentikasi gagal: ${error}`);

      /**
       * Bersihkan query parameter.
       */
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    /**
     * Setelah page load,
     * cek apakah backend sudah memberikan session cookie.
     */
    checkSession();
  }, [checkSession]);

  /**
   * Google OAuth Login
   */
  const loginWithGoogle = useCallback(() => {
    setAuthError(null);

    /**
     * URL tempat backend mengembalikan user
     * setelah Google OAuth berhasil.
     *
     * Contoh:
     * http://localhost:3000/login
     */
    const redirectUrl = `${window.location.origin}/login`;

    const googleLoginUrl =
      `${API_BASE_URL}/auth/google` +
      `?redirect_to=${encodeURIComponent(redirectUrl)}`;

    console.log("Redirecting to Google OAuth:", googleLoginUrl);

    /**
     * HARUS menggunakan browser navigation.
     * Jangan menggunakan fetch().
     */
    window.location.assign(googleLoginUrl);
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      /**
       * Clear frontend state regardless
       * whether backend logout succeeds.
       */
      setSession(null);
      setUser(null);
      setLoading(false);

      /**
       * Optional:
       * kembali ke halaman login.
       */
      window.location.assign("/login");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        loginWithGoogle,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
