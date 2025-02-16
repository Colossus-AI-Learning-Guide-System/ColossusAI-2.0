"use client";

import { Button } from "@/components/ui/signin/button";
import { Input } from "@/components/ui/signin/input";
import { Label } from "@/components/ui/signin/label";
import { resetPassword } from "@/lib/supabase/auth";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";

export default function ForgotPasswordPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email before submission
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        // Type guard for PostgrestError
        if (typeof resetError === 'object' && resetError !== null) {
          const pgError = resetError as PostgrestError;
          
          if (pgError.message?.toLowerCase().includes("rate limit")) {
            throw new Error("Too many requests. Please try again later.");
          }

          // Handle other specific error cases
          if (pgError.message?.includes("User not found")) {
            throw new Error("No account found with this email address.");
          }

          if (pgError.message?.includes("Email rate limit exceeded")) {
            throw new Error("Please wait a few minutes before trying again.");
          }

          // Generic error message for other cases
          throw new Error(pgError.message || "Failed to send reset instructions");
        }
        
        throw new Error("An unexpected error occurred");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset instructions"
      );
    } finally {
      setLoading(false);
    }
  };

  // Improved email validation with better regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email: string): boolean => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError("Email is required");
      return false;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Additional validation for common mistakes
    if (trimmedEmail.includes('..') || trimmedEmail.includes('--')) {
      setError("Please enter a valid email address");
      return false;
    }

    if (trimmedEmail.length > 254) { // Maximum length for valid emails
      setError("Email address is too long");
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-[520px] space-y-8 rounded-2xl border bg-white dark:bg-gray-900 p-8 shadow-xl transition-all">
        <div className="flex flex-col items-center gap-3">
          <div className="w-[60px] h-[60px] relative animate-pulse">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
            <div className="text-green-600 dark:text-green-400 font-medium">
              Password reset instructions have been sent to your email.
            </div>
            <p className="text-sm text-muted-foreground">
              Please check your inbox and follow the instructions to reset your password.
              <br />
              Return to{" "}
              <Link
                href="/signin"
                className="text-primary font-medium underline hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  placeholder="hi@yourcompany.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null); // Clear error when user types
                  }}
                  className="h-11"
                  required
                  // Real-time validation on blur
                  onBlur={(e) => validateEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                "Send reset instructions"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="text-primary font-medium underline hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
