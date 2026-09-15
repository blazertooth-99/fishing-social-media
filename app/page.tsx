// import AuthCallbackHandler from "@/app/components/shared/auth-callback-handler";

// export default function HomePage() {
//   return <AuthCallbackHandler />;
// }

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
