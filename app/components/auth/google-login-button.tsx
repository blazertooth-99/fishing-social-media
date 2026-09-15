// "use client";

// import { useState } from "react";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { loginWithGoogle } from "@/lib/auth/auth-client";

// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export default function GoogleLoginButton() {
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);

//   function handleGoogleLogin() {
//     setIsGoogleLoading(true);

//     loginWithGoogle();
//   }

//   return (
//     <Button
//       type="button"
//       variant="outline"
//       onClick={handleGoogleLogin}
//       disabled={isGoogleLoading}
//       className="w-full rounded-xl"
//     >
//       {isGoogleLoading ? (
//         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//       ) : (
//         <span className="mr-2 font-bold">G</span>
//       )}
//       Continue with Google
//     </Button>
//   );
// }
