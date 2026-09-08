import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, COOKIE_NAME } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run proxy on /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get(COOKIE_NAME);
  const token = tokenCookie?.value;

  const isLoginPage = pathname === "/admin/login";

  if (!token) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    // Redirect to login page
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyJWT(token);

  if (!payload || payload.role !== "ADMIN") {
    if (isLoginPage) {
      return NextResponse.next();
    }
    // Delete invalid cookie and redirect to login page
    const loginUrl = new URL("/admin/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // If already logged in, don't show login page
  if (isLoginPage) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
