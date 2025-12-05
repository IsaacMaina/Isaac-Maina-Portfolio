// src/middleware.ts
// Security and authentication middleware
import { NextRequest, NextResponse } from "next/server";

// Protect all routes except login and public assets
export async function middleware(request: NextRequest) {
  // Allow access to login page and public assets
  if (request.nextUrl.pathname.startsWith('/auth/signin') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Block suspicious requests before authentication check
  const userAgent = request.headers.get('user-agent') || '';

  // Block requests with suspicious user agents
  if (userAgent.includes('sqlmap') || userAgent.includes('nmap') || userAgent.includes('nessus')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Check for potential path traversal attempts
  const url = request.nextUrl.pathname;
  if (url.includes('../') || url.includes('..\\')) {
    return new Response('Forbidden', { status: 403 });
  }

  // For App Router, we need to check for the NextAuth JWT token in cookies
  try {
    // Get cookies from request and look for NextAuth session token
    const cookieHeader = request.headers.get('cookie');

    if (!cookieHeader) {
      // No cookies present, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.search = `callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }

    // Look for NextAuth JWT token in cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    // Check for various possible NextAuth cookie names
    const sessionToken = cookies['next-auth.session-token'] ||
                        cookies['__Secure-next-auth.session-token'] ||
                        cookies['nextauth.session-token'];

    if (!sessionToken) {
      // No session token found, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.search = `callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }

    // User has a session token, allow access
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking authentication, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }
}

// Apply middleware to all routes except login and auth API
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth/signin (auth pages)
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!auth/signin|api/auth|_next/static|_next/image|favicon.ico|static).*)',
  ],
};