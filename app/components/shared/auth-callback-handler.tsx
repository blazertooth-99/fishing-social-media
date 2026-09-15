// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/use-auth";

// const AUTH_ERRORS: Record<string, string> = {
//   access_denied: "Login dibatalkan oleh pengguna.",
//   missing_code: "Login gagal. Silakan coba lagi.",
//   missing_state: "Login gagal. Silakan coba lagi.",
//   unauthorized: "Sesi login tidak valid.",
//   forbidden: "Akun kamu tidak aktif.",
//   invalid_request: "Permintaan login tidak valid.",
//   server_error: "Terjadi gangguan server. Silakan coba lagi.",
// };

// export default function AuthCallbackHandler() {
//   const router = useRouter();
//   const { refreshSession } = useAuth();

//   useEffect(() => {
//     let mounted = true;

//     const authenticate = async () => {
//       const params = new URLSearchParams(window.location.search);
//       const authError = params.get("auth_error");

//       if (authError) {
//         const message = AUTH_ERRORS[authError] ?? "Login gagal.";
//         console.error("❌ OAUTH ERROR:", message);
//         router.replace(`/login?error=${encodeURIComponent(message)}`);
//         return;
//       }

//       try {
//         console.log("🔐 Checking session...");
//         const session = await refreshSession();
//         console.log("🔐 SESSION RESULT:", session);

//         if (!mounted) return;

//         if (session) {
//           console.log("✅ SESSION VALID -> Redirecting to /feed");
//           router.replace("/feed");
//           return;
//         }

//         console.log("❌ SESSION EMPTY -> Redirecting to /login");
//         router.replace("/login");
//       } catch (error) {
//         console.error("❌ SESSION CHECK ERROR:", error);
//         if (!mounted) return;
//         router.replace("/login");
//       }
//     };

//     authenticate();

//     return () => {
//       mounted = false;
//     };
//   }, [router, refreshSession]);

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-50">
//       <div className="text-center">
//         <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
//         <p className="text-sm font-medium text-slate-600">
//           Checking your fishing session...
//         </p>
//       </div>
//     </main>
//   );
// }
