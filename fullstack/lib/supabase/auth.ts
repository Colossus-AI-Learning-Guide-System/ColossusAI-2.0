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
    // Basic validation
    if (!email || !password || !fullName) {
      throw new Error("All fields are required");
    }

    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const authError = {
        type: 'AUTH_ERROR',
        code: error.status || 'UNKNOWN',
        message: error.message,
        metadata: error.status ? { status: error.status } : {},
        email,
        timestamp: new Date().toISOString()
      };
      console.error("Auth signup error:", authError);

      if (error.message?.includes("duplicate key") || 
          error.message?.includes("already registered")) {
        throw new Error("An account with this email already exists. Please sign in or reset your password.");
      }
      if (error.message?.includes("rate limit")) {
        throw new Error("Too many signup attempts. Please try again in a few minutes.");
      }
      throw error;
    }

    if (!data?.user) {
      throw new Error("Signup failed. Please try again.");
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      const profileErrorDetails = {
        type: 'PROFILE_ERROR',
        code: profileError.code || 'UNKNOWN',
        message: profileError.message || 'Unknown error occurred',
        metadata: {},
        userId: data.user.id,
        email,
        timestamp: new Date().toISOString()
      };

      console.error("Profile creation error:", profileErrorDetails);

      // Clean up auth user
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch (deleteError: any) {
        console.error("Failed to clean up auth user:", {
          type: 'CLEANUP_ERROR',
          code: deleteError.code || 'UNKNOWN',
          message: deleteError.message || 'Unknown error occurred',
          metadata: {},
          userId: data.user.id,
          email,
          timestamp: new Date().toISOString()
        });
      }

      throw new Error("We encountered an issue setting up your profile. Please try again.");
    }

    return { data, error: null };
  } catch (error: any) {
    const processError = {
      type: 'PROCESS_ERROR',
      code: error.code || 'UNKNOWN',
      message: error.message || 'An unexpected error occurred',
      metadata: {},
      email,
      timestamp: new Date().toISOString()
    };
    console.error("Signup process error:", processError);

    return { 
      data: null, 
      error: {
        message: error.message || "An unexpected error occurred during signup."
      }
    };
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
export const signInWithOAuth = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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
