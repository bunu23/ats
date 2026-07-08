import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('ats_session')?.value;

  // The paths we want to protect
  const protectedPaths = ['/', '/pipeline', '/jobs', '/candidates', '/activity', '/automation'];

  // Check if current path is in protected paths (or is exactly /)
  // Also protect any sub-routes of these
  const isProtectedPath = protectedPaths.some(
    path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  );

  // Allow access to public paths explicitly just in case
  if (
    request.nextUrl.pathname.startsWith('/careers') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/')
  ) {
    return NextResponse.next();
  }

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedPath && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
