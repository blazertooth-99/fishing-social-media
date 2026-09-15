"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getSession,
  loginWithGoogle,
  logout,
  type AuthSession,
  type CurrentUser,
} from "@/lib/api/auth";

/**
 * ==============================
 * CONTEXT TYPE
 * ==============================
 */

interface AuthContextValue {
  user: CurrentUser | null;
  session: AuthSession | null;

  loading: boolean;
  authenticated: boolean;

  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * ==============================
 * CONTEXT
 * ==============================
 */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * ==============================
 * PROVIDER
 * ==============================
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [session, setSession] = useState<AuthSession | null>(null);

  const [loading, setLoading] = useState(true);

  /**
   * ==============================
   * CHECK SESSION
   * ==============================
   */

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);

      console.log("[AUTH] Checking session...");

      const sessionResponse = await getSession();

      const currentSession = sessionResponse?.data;

      /**
       * Tidak ada session
       */
      if (!currentSession?.user_id) {
        setSession(null);
        setUser(null);

        return;
      }

      /**
       * Session valid
       */
      setSession(currentSession);

      console.log("[AUTH] Session valid:", currentSession);

      /**
       * Ambil user profile
       */
      try {
        const userResponse = await getCurrentUser();

        setUser(userResponse?.data ?? null);

        console.log("[AUTH] User:", userResponse?.data);
      } catch (error) {
        /**
         * Kalau /users/me gagal,
         * session tetap dianggap valid.
         */
        console.warn("[AUTH] Failed to get user profile:", error);

        setUser({
          user_id: currentSession.user_id,

          email: currentSession.email,
        });
      }
    } catch (error) {
      console.log("[AUTH] No active session:", error);

      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ==============================
   * INITIAL SESSION CHECK
   * ==============================
   */

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /**
   * ==============================
   * GOOGLE LOGIN
   * ==============================
   */

  const login = useCallback(() => {
    loginWithGoogle();
  }, []);

  /**
   * ==============================
   * LOGOUT
   * ==============================
   */

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("[AUTH] Logout failed:", error);
    } finally {
      setSession(null);
      setUser(null);

      window.location.href = "/login";
    }
  }, []);

  /**
   * ==============================
   * CONTEXT VALUE
   * ==============================
   */

  const value: AuthContextValue = {
    user,
    session,

    loading,

    authenticated: Boolean(session),

    login,
    logout: handleLogout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * ==============================
 * HOOK
 * ==============================
 */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
