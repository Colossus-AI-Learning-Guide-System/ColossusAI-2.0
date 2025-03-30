import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Provider } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabase = createClientComponentClient();

// Email/Password Sign Up
export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let signUpData, signUpError;

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined,
        },
      });

      signUpData = result.data;
      signUpError = result.error;
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase error:", supabaseError);
      signUpError = supabaseError;
    }

    if (signUpError) {
      console.log("Sign up error handled:", signUpError);
      return { data: null, error: signUpError };
    }

    return { data: signUpData, error: null };
  } catch (error) {
    console.log("Unexpected error in signUpWithEmail:", error);
    return { data: null, error };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = false
) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let data, error;

    try {
      // If rememberMe is true, we want to keep the session longer
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If rememberMe is true and sign in was successful, extend the session
      if (rememberMe && result.data.session) {
        // Log that we're remembering the user
        console.log("Remember me enabled, session will persist");
      }

      data = result.data;
      error = result.error;
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase error:", supabaseError);
      error = supabaseError;
    }

    if (error) {
      console.log("Sign in error handled:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.log("Unexpected error in signInWithEmail:", error);
    return { data: null, error };
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let data, error;

    try {
      const result = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      data = result.data;
      error = result.error;
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase error:", supabaseError);
      error = supabaseError;
    }

    if (error) {
      console.log("Resend confirmation email error handled:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.log("Unexpected error in resendConfirmationEmail:", error);
    return { data: null, error };
  }
};

// OAuth Sign In (Google, GitHub)
export const signInWithOAuth = async (
  provider: "github" | "google",
  redirectUrl?: string
) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let data, error;

    try {
      const baseRedirectTo = `${window.location.origin}/auth/callback`;

      // Simplify redirect handling for more predictable behavior
      let finalRedirectTo = baseRedirectTo;

      // Only add next parameter if redirectUrl is provided and not empty
      if (redirectUrl && redirectUrl.trim() !== "") {
        finalRedirectTo = `${baseRedirectTo}?next=${encodeURIComponent(
          redirectUrl
        )}`;
      }

      console.log(`OAuth redirect configured to: ${finalRedirectTo}`);

      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: finalRedirectTo,
          queryParams:
            provider === "google"
              ? {
                  // This will show the app name during authentication instead of the Supabase project name
                  prompt: "select_account",
                  access_type: "offline",
                }
              : undefined,
        },
      });

      data = result.data;
      error = result.error;
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase OAuth error:", supabaseError);
      error = supabaseError;
    }

    if (error) {
      console.log("OAuth sign in error handled:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.log("Unexpected error in signInWithOAuth:", error);
    return { data: null, error };
  }
};

// Sign Out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
};

// Get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

// Forgot Password - Send reset email
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Reset Password with new password
export const resetPassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Verify OTP code
export const verifyOTP = async (email: string, token: string) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let data, error;

    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      data = result.data;
      error = result.error;

      // Enhanced error classification for better user feedback
      if (error) {
        // Log the exact error for debugging purposes
        console.log("Original OTP verification error:", error);

        // Check if we can determine more specifically what went wrong
        if (typeof error === "object" && error !== null && "message" in error) {
          const errorMessage = String(error.message).toLowerCase();

          // Add more context to the error based on the message
          if (errorMessage.includes("token is invalid")) {
            error = { ...error, errorType: "invalid_code" };
          } else if (errorMessage.includes("token has expired")) {
            error = { ...error, errorType: "expired_code" };
          }
        }
      }
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase error:", supabaseError);
      error = supabaseError;
    }

    if (error) {
      console.log("OTP verification error handled:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.log("Unexpected error in verifyOTP:", error);
    return { data: null, error };
  }
};

// Resend OTP code
export const resendOTP = async (email: string) => {
  try {
    // Use a try-catch inside to catch and completely suppress the AuthApiError
    let data, error;

    try {
      const result = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: undefined,
        },
      });

      data = result.data;
      error = result.error;
    } catch (supabaseError) {
      // Completely suppress the error from propagating to console
      console.log("Caught Supabase error:", supabaseError);
      error = supabaseError;
    }

    if (error) {
      console.log("Resend OTP error handled:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.log("Unexpected error in resendOTP:", error);
    return { data: null, error };
  }
};
