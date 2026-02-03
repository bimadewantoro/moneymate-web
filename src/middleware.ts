import { auth } from "@/auth";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAppRoute = req.nextUrl.pathname.startsWith("/app");

  if (isAppRoute && !isAuthenticated) {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
