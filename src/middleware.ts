import { auth } from "@/auth";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes: dashboard pages (under route group, URL starts with /)
  // We protect: /transactions, /budget, /profile, /onboarding, and the dashboard root /
  // But NOT: /signin, /api, /_next, static assets
  const publicPaths = ["/signin", "/api", "/_next", "/favicon.ico"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  // The marketing page is at / via (marketing) route group
  // The dashboard is also at / via (dashboard) route group
  // We need to protect dashboard-only routes
  const dashboardPaths = ["/dashboard", "/transactions", "/budget", "/profile", "/onboarding"];
  const isDashboardRoute = dashboardPaths.some((p) => pathname.startsWith(p));

  if (isDashboardRoute && !isAuthenticated) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
