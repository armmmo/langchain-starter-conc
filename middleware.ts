import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/pricing', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Protected routes that require authentication
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Admin-only routes
    const adminRoutes = ['/admin', '/api/admin'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    
    if (isAdminRoute && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Chat and AI routes require active subscription or within limits
    const aiRoutes = ['/api/chat', '/dashboard/chat'];
    const isAiRoute = aiRoutes.some(route => pathname.startsWith(route));

    if (isAiRoute) {
      // In a real app, you'd check usage limits here
      // For now, we'll allow access for authenticated users
      if (!token.teams || token.teams.length === 0) {
        return NextResponse.json(
          { error: 'No team found. Please contact support.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
        const publicRoutes = ['/', '/pricing', '/api/auth'];
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};