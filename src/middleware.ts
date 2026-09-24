import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js internal requests, and logo images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isPendingRoute = pathname === "/pending-approval";
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  // Allow API auth routes without redirection
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Handle guest trying to access auth pages (/login, /register)
  if (isAuthRoute) {
    if (session) {
      if (session.status === "PENDING") {
        return NextResponse.redirect(new URL("/pending-approval", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Handle /pending-approval route
  if (isPendingRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.status === "APPROVED") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // For all other routes, if session is PENDING, send to /pending-approval (except the public landing page '/')
  if (session && session.status === "PENDING" && pathname !== "/") {
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }

  // Protect Super Admin routes
  if (pathname.startsWith("/admin/super")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!session.roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect Admin routes
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      !session.roles.includes("ADMIN") &&
      !session.roles.includes("SUPER_ADMIN")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect Finance routes (Subscription Manager, Admin, Super Admin)
  if (pathname.startsWith("/finance")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      !session.roles.includes("SUBSCRIPTION_MANAGER") &&
      !session.roles.includes("ADMIN") &&
      !session.roles.includes("SUPER_ADMIN")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect Member Portal routes (Songs, Attendance, Excuses, Points, Subscriptions)
  const isMemberGatedRoute =
    pathname.startsWith("/songs") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/excuses") ||
    pathname.startsWith("/points") ||
    pathname.startsWith("/subscriptions");

  if (isMemberGatedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/.*).*)",
  ],
};

