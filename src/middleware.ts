import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Allow access to all routes without authentication
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (SEO files)
     */
    "/((?!_next|static|favicon.ico|robots.txt).*)",
  ],
}; 