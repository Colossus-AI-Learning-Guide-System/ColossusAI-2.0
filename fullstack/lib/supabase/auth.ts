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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      }
    );

    if (signUpError) {
      throw signUpError;
    }

    return { data: signUpData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

// OAuth Sign In (Google, GitHub)
export const signInWithOAuth = async (provider: Provider, redirectUrl?: string) => {
  const baseRedirectTo = `${window.location.origin}/auth/callback`;
  // Append a next parameter to the redirect URL
  const finalRedirectTo = redirectUrl 
    ? `${baseRedirectTo}?next=${encodeURIComponent(redirectUrl)}` 
    : baseRedirectTo;
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: finalRedirectTo,
    },
  });
  return { data, error };
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