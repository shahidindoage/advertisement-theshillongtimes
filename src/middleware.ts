import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  
  // Protect /book and /orders routes
  const isProtectedRoute = nextUrl.pathname.startsWith("/book") || nextUrl.pathname.startsWith("/orders");
  
  if (isProtectedRoute) {
    const hasSession = 
      cookies.has("authjs.session-token") || 
      cookies.has("__Secure-authjs.session-token") ||
      cookies.has("next-auth.session-token") || 
      cookies.has("__Secure-next-auth.session-token");
    
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
