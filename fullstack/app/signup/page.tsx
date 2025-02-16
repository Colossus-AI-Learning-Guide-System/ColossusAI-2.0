"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
import {
  signUpWithEmail,
  signInWithOAuth,
  resendConfirmationEmail,
} from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/signin/checkbox";

export default function SignUpPage() {
  const id = useId();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setSuccessMessage(
        "Confirmation email has been resent. Please check your inbox."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend confirmation email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowResendButton(false);

    try {
      // Validate inputs
      if (!fullName.trim()) {
        throw new Error("Full name is required");
      }
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Attempt to sign up
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (signUpError) {
        const errorMessage =
          typeof signUpError === "object" && signUpError !== null
            ? (signUpError as { message?: string }).message
            : "Unknown error occurred";

        if (errorMessage?.toLowerCase().includes("rate limit")) {
          throw new Error(
            "Too many sign-up attempts. Please wait a few minutes before trying again."
          );
        } else if (
          errorMessage?.includes("unique constraint") ||
          errorMessage?.includes("already registered")
        ) {
          throw new Error("An account with this email already exists");
        }
        throw new Error(errorMessage || "Failed to create account");
      }

      // Show success message
      setError(null);
      setSuccess(true);
      setShowResendButton(true);
      setSuccessMessage(
        "Sign up successful! Please check your email for a confirmation link. Click the link to verify your email address."
      );
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during sign up"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "github" | "google") => {
    setError(null);
    setLoading(true);

    try {
      const { error: oauthError } = await signInWithOAuth(provider);
      if (oauthError) {
        throw new Error(
          typeof oauthError === "object" && oauthError !== null
            ? (oauthError as { message?: string }).message ||
              `Failed to sign up with ${provider}`
            : `Failed to sign up with ${provider}`
        );
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to sign up with ${provider}`
      );
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start your journey with Colossus.AI
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center space-y-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
            <div className="text-green-600 dark:text-green-400 font-medium">{successMessage}</div>
            {showResendButton && (
              <button
                onClick={handleResendConfirmation}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                disabled={loading}
              >
                {loading ? "Sending..." : "Didn't receive the email? Click to resend"}
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              Already confirmed your email?{" "}
              <Link
                href="/signin"
                className="text-primary font-medium underline hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailSignUp} className="space-y-6">
              {error && (
                <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${id}-name`} className="text-sm font-medium">Full name</Label>
                  <Input
                    id={`${id}-name`}
                    placeholder="Matt Welsh"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-email`} className="text-sm font-medium">Email</Label>
                  <Input
                    id={`${id}-email`}
                    placeholder="hi@yourcompany.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-password`} className="text-sm font-medium">Password</Label>
                  <Input
                    id={`${id}-password`}
                    placeholder="Enter your password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  required
                  aria-required="true"
                  className="mt-1"
                />
                <label 
                  htmlFor="terms" 
                  className="text-sm text-muted-foreground"
                >
                  I confirm that I have read, consent to, and agree to Colossus.AI's{' '}
                  <Link 
                    href="/terms" 
                    className="text-primary font-medium underline hover:no-underline"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link 
                    href="/privacy" 
                    className="text-primary font-medium underline hover:no-underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing up...
                  </div>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-11 text-base font-medium hover:scale-[1.02] transition-all"
                  onClick={() => handleOAuthSignUp("google")}
                  type="button"
                >
                  <RiGoogleFill size={20} className="mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-11 text-base font-medium hover:scale-[1.02] transition-all"
                  onClick={() => handleOAuthSignUp("github")}
                  type="button"
                >
                  <RiGithubFill size={20} className="mr-2" />
                  GitHub
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-primary font-medium underline hover:no-underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
