import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Auth/Public Entry Routes
  const isAuthRoute = pathname === "/" || pathname === "/admin";

  // Protected Routes
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // If token exists and user tries to access login page
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If no token and user tries to access protected page
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Ignore:
     * - api routes
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - images/files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};