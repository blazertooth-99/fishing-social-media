// "use client";

// import { useCallback, useEffect, useState } from "react";

// import { authService } from "@/lib/services/auth.service";
// import type { AuthSession } from "@/lib/types/auth";

// interface UseAuthReturn {
//   session: AuthSession | null;
//   loading: boolean;
//   error: string | null;

//   isAuthenticated: boolean;

//   loginWithGoogle: () => void;
//   logout: () => Promise<void>;
//   refreshSession: () => Promise<void>;
// }

// export function useAuth(): UseAuthReturn {
//   const [session, setSession] = useState<AuthSession | null>(null);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState<string | null>(null);

//   const refreshSession = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const data = await authService.getSession();

//       setSession(data);
//     } catch (error) {
//       console.error("Failed to get session:", error);

//       setSession(null);

//       setError(
//         error instanceof Error ? error.message : "Failed to get session",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       await authService.logout();

//       setSession(null);
//     } catch (error) {
//       console.error("Logout failed:", error);

//       setError(error instanceof Error ? error.message : "Logout failed");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const loginWithGoogle = useCallback(() => {
//     authService.loginWithGoogle();
//   }, []);

//   useEffect(() => {
//     refreshSession();
//   }, [refreshSession]);

//   return {
//     session,
//     loading,
//     error,

//     isAuthenticated: Boolean(session),

//     loginWithGoogle,
//     logout,
//     refreshSession,
//   };
// }
