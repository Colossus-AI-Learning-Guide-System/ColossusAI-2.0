import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Just pass through all requests - this ensures our client components work
  return NextResponse.next();
}

// Configure the paths that should use this middleware
export const config = {
  matcher: [
    '/signin/:path*',
    '/signup/:path*',
    '/forgot-password/:path*',
    '/reset-password/:path*',
    '/dashboard/:path*',
  ],
};
