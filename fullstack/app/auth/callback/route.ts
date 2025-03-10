import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Exchange the code for a session
      const { error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("Session exchange error:", sessionError);
        throw sessionError;
      }

      // Check if the user's email is confirmed
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User fetch error:", userError);
        throw userError;
      }

      if (!user?.email_confirmed_at) {
        return NextResponse.redirect(
          new URL(
            `/signin?message=Please confirm your email to continue`,
            requestUrl.origin
          )
        );
      }

      // Redirect to dashboard after successful verification
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error: unknown) {
      console.error("Auth callback error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return NextResponse.redirect(
        new URL(
          `/signin?error=Authentication failed: ${errorMessage}`,
          requestUrl.origin
        )
      );
    }
  }

  // If no code, redirect to home page
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
