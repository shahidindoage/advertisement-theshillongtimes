import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  
  // Protect /book and /orders routes
  const isProtectedRoute = nextUrl.pathname.startsWith("/book") || nextUrl.pathname.startsWith("/orders");
  
  if (isProtectedRoute) {
    // A lightweight check for the presence of the NextAuth session cookie
    // This avoids importing Prisma/bcrypt into the Edge runtime (which causes the 1MB limit error)
    const hasSession = cookies.has("next-auth.session-token") || cookies.has("__Secure-next-auth.session-token");
    
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
