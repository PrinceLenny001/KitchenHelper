import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signout",
    "/auth/error",
    "/auth/verify",
    "/api/auth",
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the session token
  const token = await getToken({ req: request });
  
  // If there's no token and the path is not public, redirect to signin
  if (!token) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If there's a token, allow access
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
     * 4. /api/auth (NextAuth.js API routes)
     */
    "/((?!_next|static|favicon.ico|robots.txt).*)",
  ],
}; 