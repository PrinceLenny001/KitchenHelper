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
  
  // Check if the path is public or an API route
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Special handling for API routes
  const isApiRoute = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');
  
  // Special handling for auth callback routes
  const isAuthCallback = pathname.startsWith('/api/auth/callback');
  
  // If it's a public path or auth callback, allow access
  if (isPublicPath || isAuthCallback) {
    return NextResponse.next();
  }
  
  // Get the session token with proper secret
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If there's no token and the path is not public
  if (!token) {
    // For API routes, return 401 Unauthorized
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    
    // For regular routes, redirect to signin with the callback URL
    // Do NOT encode the pathname - NextAuth will handle this
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
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
     */
    "/((?!_next|static|favicon.ico|robots.txt).*)",
  ],
}; 