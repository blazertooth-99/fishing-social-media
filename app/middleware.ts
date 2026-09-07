// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const protectedRoutes = [
//   "/feed",
//   "/profile",
//   "/post",
//   "/community",
//   "/settings",
// ];

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const isProtected = protectedRoutes.some((route) =>
//     pathname.startsWith(route),
//   );

//   if (!isProtected) {
//     return NextResponse.next();
//   }

//   const session = request.cookies.get("fishing_session");

//   if (!session) {
//     const loginUrl = new URL("/login", request.url);

//     loginUrl.searchParams.set("callbackUrl", pathname);

//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/feed/:path*",
//     "/profile/:path*",
//     "/post/:path*",
//     "/community/:path*",
//     "/settings/:path*",
//   ],
// };
