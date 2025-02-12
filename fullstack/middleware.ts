import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition
  if (session?.user) {
    // If the user is signed in and the current path is / or /signin or /signup,
    // redirect the user to /dashboard.
    if (["/", "/signin", "/signup"].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    // Auth condition not met, redirect to signin page.
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return res;
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Also exclude api routes and public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|api|assets).*)",
  ],
};
