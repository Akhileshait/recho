import { NextResponse } from "next/server";

// This middleware runs on all requests
export function middleware() {
  // Allow all requests to pass through
  // Authentication is handled at the page/API level
  return NextResponse.next();
}

export const config = {
  // Don't run middleware on these paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
