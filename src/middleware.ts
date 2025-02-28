import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
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
  
  // Special handling for verification token in URL
  const hasVerificationToken = search.includes('token=');
  
  // If it's a public path, auth callback, or has a verification token, allow access
  if (isPublicPath || isAuthCallback || hasVerificationToken) {
    console.log(`Middleware: Allowing access to: ${pathname}${search}`);
    return NextResponse.next();
  }
  
  // Debug: Log all cookies
  console.log("Middleware: Cookies:", Array.from(request.cookies.getAll()).map(cookie => cookie.name).join(', '));
  
  // Check for session cookie directly - include all possible cookie names
  const sessionCookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token'
  ];
  
  const sessionCookies = sessionCookieNames
    .filter(name => request.cookies.has(name))
    .map(name => ({ name, value: request.cookies.get(name)?.value }));
  
  if (sessionCookies.length > 0) {
    console.log("Middleware: Found session cookies:", sessionCookies.map(c => c.name).join(', '));
    
    try {
      // Get the session token with proper secret
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production"
      });
      
      if (token) {
        console.log(`Middleware: Authenticated access to: ${pathname} with token:`, token.email);
        return NextResponse.next();
      } else {
        console.log("Middleware: Token validation failed");
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
  } else {
    console.log("Middleware: No session cookies found");
  }
  
  console.log(`Middleware: No valid session for: ${pathname}`);
  
  // If there's no valid session
  if (isApiRoute) {
    // For API routes, return 401 Unauthorized
    console.log(`Middleware: API route without token: ${pathname}`);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  
  // For regular routes, redirect to signin with the callback URL
  console.log(`Middleware: Redirecting to signin with callback: ${pathname}`);
  const url = new URL("/auth/signin", request.url);
  url.searchParams.set("callbackUrl", pathname);
  
  console.log(`Middleware: Redirect URL: ${url.toString()}`);
  return NextResponse.redirect(url);
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