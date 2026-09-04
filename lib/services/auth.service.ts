// import { apiClient } from "@/lib/api/client";
// import { API_ENDPOINTS } from "@/lib/api/endpoints";
// import type { AuthSession } from "@/lib/types/auth";

// export const authService = {
//   /**
//    * Get current authenticated session
//    */
//   async getSession(): Promise<AuthSession> {
//     return apiClient<AuthSession>(API_ENDPOINTS.auth.session, {
//       method: "GET",
//     });
//   },

//   /**
//    * Logout current user
//    */
//   async logout(): Promise<void> {
//     await apiClient<void>(API_ENDPOINTS.auth.logout, {
//       method: "POST",
//     });
//   },

//   /**
//    * Start Google OAuth
//    *
//    * This endpoint should be opened by the browser
//    * because OAuth requires redirect navigation.
//    */
//   loginWithGoogle(): void {
//     const API_URL = process.env.NEXT_PUBLIC_API_URL;

//     if (!API_URL) {
//       throw new Error("NEXT_PUBLIC_API_URL is not defined");
//     }

//     window.location.assign(`${API_URL}${API_ENDPOINTS.auth.google}`);
//   },

//   /**
//    * Check username availability
//    */
//   async checkUsername(username: string) {
//     return apiClient<unknown>(API_ENDPOINTS.users.checkUsername, {
//       method: "GET",
//       params: {
//         username,
//       },
//     });
//   },
// };
