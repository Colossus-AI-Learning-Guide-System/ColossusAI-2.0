"use client";

import { Button } from "@/components/ui/signin/button";
import { Input } from "@/components/ui/signin/input";
import { Label } from "@/components/ui/signin/label";
import { updatePassword } from "@/lib/supabase/auth";
import { AuthError } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for valid reset token and set up session on page load
  useEffect(() => {
    const setupSession = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError("Invalid password reset link. Please request a new one.");
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError("Invalid or expired reset link. Please request a new one.");
        }
      } catch (err) {
        setError("Failed to validate reset link. Please request a new one.");
      }
    };

    setupSession();
  }, [searchParams, supabase.auth]);

  const validatePassword = (password: string): boolean => {
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Check for at least one number
    if (!/\d/.test(trimmedPassword)) {
      setError("Password must contain at least one number");
      return false;
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(trimmedPassword)) {
      setError("Password must contain at least one letter");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await updatePassword(password);

      if (resetError) {
        // Handle specific error cases
        const errorMessage = resetError.message.toLowerCase();
        
        if (errorMessage.includes("session") || errorMessage.includes("jwt")) {
          setError("Your password reset link has expired. Please request a new one.");
          return;
        }
        
        setError(resetError.message || "Failed to reset password. Please try again.");
        return;
      }

      // Success - redirect to signin
      router.push("/signin?message=Password reset successful. Please sign in with your new password.");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An error occurred. Please request a new password reset link.");
    } finally {
      setLoading(false);
    }
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
              Please create a strong password that:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside text-left space-y-1">
              <li>Is at least 6 characters long</li>
              <li>Contains at least one number</li>
              <li>Contains at least one letter</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
              {error.includes("expired") && (
                <div className="mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-primary font-medium underline hover:no-underline"
                  >
                    Request new reset link
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`} className="text-sm font-medium">
                New Password
              </Label>
              <Input
                id={`${id}-password`}
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="h-11"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-confirm-password`} className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id={`${id}-confirm-password`}
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className="h-11"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02]"
            disabled={loading || !searchParams.get('code')}
          >
            {loading ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting password...
              </div>
            ) : (
              "Reset password"
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
      </div>
    </div>
  );
}
