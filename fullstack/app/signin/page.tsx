"use client";

import { Button } from "@/components/ui/signin/button";
import { Checkbox } from "@/components/ui/signin/checkbox";
import { Input } from "@/components/ui/signin/input";
import { Label } from "@/components/ui/signin/label";
import {
    resendConfirmationEmail,
    signInWithEmail,
    signInWithOAuth,
} from "@/lib/supabase/auth";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

export default function SignInPage() {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("message")
  );
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    setShowResendButton(false);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before signing in");
          setShowResendButton(true);
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password");
        } else {
          throw error;
        }
        return;
      }

      if (data?.session) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Signin error:", err);
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setError(null);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setMessage(
        "Confirmation email has been resent. Please check your inbox."
      );
    } catch (err: any) {
      setError(err.message || "Failed to resend confirmation email");
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
          <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to login to your account.
          </p>
        </div>
      </div>

      <form onSubmit={handleEmailSignIn} className="space-y-5">
        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
            {showResendButton && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="ml-2 text-blue-500 hover:underline"
                disabled={loading}
              >
                Resend confirmation email
              </button>
            )}
          </div>
        )}
        {message && (
          <div className="text-sm text-blue-500 text-center">{message}</div>
        )}
        <div className="space-y-4">
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
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-remember`} />
            <Label
              htmlFor={`${id}-remember`}
              className="font-normal text-muted-foreground"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm underline hover:no-underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or continue with</span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            aria-label="Login with Google"
            className="h-11 w-11"
            onClick={() => handleOAuthSignIn("google")}
            type="button"
          >
            <RiGoogleFill size={20} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            aria-label="Login with GitHub"
            className="h-11 w-11"
            onClick={() => handleOAuthSignIn("github")}
            type="button"
          >
            <RiGithubFill size={20} aria-hidden="true" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline hover:no-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
