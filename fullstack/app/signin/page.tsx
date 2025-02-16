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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to Colossus.AI
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  disabled={loading}
                >
                  Resend confirmation email
                </button>
              )}
            </div>
          )}
          {message && (
            <div className="text-sm text-blue-600 dark:text-blue-400 text-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id={`${id}-remember`} />
              <Label
                htmlFor={`${id}-remember`}
                className="text-sm font-medium text-muted-foreground"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign in"
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
              onClick={() => handleOAuthSignIn("google")}
              type="button"
            >
              <RiGoogleFill size={20} className="mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11 text-base font-medium hover:scale-[1.02] transition-all"
              onClick={() => handleOAuthSignIn("github")}
              type="button"
            >
              <RiGithubFill size={20} className="mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium underline hover:no-underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
