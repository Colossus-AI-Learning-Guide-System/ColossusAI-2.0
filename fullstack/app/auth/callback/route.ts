import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Use dynamic redirect based on request origin
  const nextParam = requestUrl.searchParams.get("next");

  // Default redirect to chatpage, ensuring we use the full origin
  const defaultNextUrl = `${requestUrl.origin}/chatpage`;
  const next = nextParam ?? defaultNextUrl;

  // Log the callback parameters to help with debugging
  console.log("Auth callback params:", {
    url: request.url,
    code: code ? "exists" : "missing",
    next: next,
  });

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

      // Skip email confirmation check for OAuth providers since they're pre-verified
      if (!user?.app_metadata?.provider && !user?.email_confirmed_at) {
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
      let redirectUrl: URL;

      // Handle different redirect URL formats
      if (next.startsWith("http")) {
        // If it's already a full URL, use it directly
        redirectUrl = new URL(next);
      } else if (next.startsWith("/")) {
        // If it's a path starting with /, use it with the current origin
        redirectUrl = new URL(next, requestUrl.origin);
      } else {
        // Otherwise assume it's a relative path and add / prefix
        redirectUrl = new URL(`/${next}`, requestUrl.origin);
      }

      console.log(`Auth callback: Redirecting to ${redirectUrl.toString()}`);
      return NextResponse.redirect(redirectUrl.toString());
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
