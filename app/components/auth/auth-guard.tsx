// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/use-auth";

// interface AuthGuardProps {
//   children: React.ReactNode;
// }

// export default function AuthGuard({ children }: AuthGuardProps) {
//   const router = useRouter();
//   const { loading, isAuthenticated } = useAuth();

//   useEffect(() => {
//     if (!loading && !isAuthenticated) {
//       router.replace("/login");
//     }
//   }, [loading, isAuthenticated, router]);

//   if (loading) {
//     return (
//       <div className="flex min-h-dvh items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
//           <div className="text-sm font-medium text-slate-500">Checking your session...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   return <>{children}</>;
// }
