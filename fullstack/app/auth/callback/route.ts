import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Use dynamic redirect based on request origin
  const next =
    requestUrl.searchParams.get("next") ?? `${requestUrl.origin}/chatpage`;

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      console.log("Auth callback: Exchanging code for session");
      // Exchange the code for a session
      const { error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("Session exchange error:", sessionError);
        throw sessionError;
      }

      // Check if the user's email is confirmed
      console.log("Auth callback: Getting user");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User fetch error:", userError);
        throw userError;
      }

      if (!user) {
        console.error("No user found after authentication");
        throw new Error("No user found after authentication");
      }

      console.log("Auth callback: User authenticated:", user.id);

      if (!user?.email_confirmed_at) {
        console.log("Auth callback: Email not confirmed");
        return NextResponse.redirect(
          new URL(
            `/signin?message=Please confirm your email to continue`,
            requestUrl.origin
          )
        );
      }

      // Check if the user already has a profile, if not create one
      console.log("Auth callback: Checking if user has a profile");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        console.log("Auth callback: Creating new profile for user");
        // No profile found, create one
        const { error: createError } = await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          email: user.email,
          updated_at: new Date().toISOString(),
        });

        if (createError) {
          console.error("Profile creation error:", createError);
          // Don't throw, just log - we still want to redirect the user
        } else {
          console.log("Auth callback: Profile created successfully");
        }
      } else if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Don't throw, just log - we still want to redirect the user
      } else {
        console.log("Auth callback: User already has a profile");
      }

      // When redirecting, use the absolute URL instead of relative path
      console.log(`Auth callback: Redirecting to ${next}`);
      return NextResponse.redirect(
        next.startsWith("http") ? next : new URL(next, requestUrl.origin)
      );
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
