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
    <div className="mx-auto w-full max-w-[400px] space-y-6 rounded-xl border bg-card p-6 shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="w-[44px] h-[44px] relative">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-1.5 text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Sign up Origin UI
          </h1>
          <p className="text-sm text-muted-foreground">
            We just need a few details to get you started.
          </p>
        </div>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="text-green-600 font-medium">{successMessage}</div>
          {showResendButton && (
            <button
              onClick={handleResendConfirmation}
              className="text-blue-600 hover:underline text-sm"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Didn't receive the email? Click to resend"}
            </button>
          )}
          <p className="text-sm text-muted-foreground">
            Already confirmed your email?{" "}
            <Link
              href="/signin"
              className="text-primary underline hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleEmailSignUp} className="space-y-5">
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-name`}>Full name</Label>
                <Input
                  id={`${id}-name`}
                  placeholder="Matt Welsh"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input
                  id={`${id}-email`}
                  placeholder="hi@yourcompany.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-password`}>Password</Label>
                <Input
                  id={`${id}-password`}
                  placeholder="Enter your password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="terms" 
                required
                aria-required="true"
              />
              <label 
                htmlFor="terms" 
                className="text-sm text-muted-foreground"
              >
                I confirm that I have read, consent to, and agree to Colossus.AI's{' '}
                <Link 
                  href="/terms" 
                  className="text-primary underline hover:no-underline"
                >
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link 
                  href="/privacy" 
                  className="text-primary underline hover:no-underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-xs text-muted-foreground">
              Or continue with
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                aria-label="Sign up with Google"
                className="h-11 w-11"
                onClick={() => handleOAuthSignUp("google")}
                type="button"
              >
                <RiGoogleFill size={20} aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                aria-label="Sign up with GitHub"
                className="h-11 w-11"
                onClick={() => handleOAuthSignUp("github")}
                type="button"
              >
                <RiGithubFill size={20} aria-hidden="true" />
              </Button>
            </div>

            <div className="space-y-2 text-center text-sm">

              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-primary underline hover:no-underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
