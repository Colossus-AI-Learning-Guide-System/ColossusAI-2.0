import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Exchange the code for a session
      const { error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;

      // Redirect to dashboard after successful OAuth
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL(`/signin?error=Authentication failed`, requestUrl.origin)
      );
    }
  }

  // If no code, redirect to home page
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
