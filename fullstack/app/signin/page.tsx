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
import { RiGithubFill } from "@remixicon/react";
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
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        setError("Please enter your email address");
        return; // Exit the function if email is empty
      }
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address (e.g., example@domain.com)");
        return; // Exit the function if email is invalid
      }

      // Validate password
      if (!password.trim()) {
        setError("Please enter your password");
        return; // Exit the function if password is empty
      }

      const { data, error } = await signInWithEmail(email, password);
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        
        if (errorMessage.includes("Email not confirmed")) {
          setError("Your email address hasn't been verified. Please check your inbox and click the verification link.");
          setShowResendButton(true);
        } else if (errorMessage.includes("Invalid login credentials")) {
          setError("The email or password you entered is incorrect. Please try again.");
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
      setError(
        err.message || 
        "We couldn't sign you in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        throw new Error(
          `Unable to sign in with ${provider}. Please try again or use another sign-in method.`
        );
      }
    } catch (err: any) {
      setError(
        err.message || 
        `We couldn't complete your ${provider} sign-in. Please try again later.`
      );
    } finally {
      setLoading(false);
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
    <div className="flex min-h-screen">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B6B] via-[#FF3399] to-[#9933FF] p-12">
        <div className="flex flex-col justify-center text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">WELCOME</h1>
          <p className="text-lg opacity-90">Sign in to continue your journey with ColossusAI</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2"></div>
      </div>

      {/* Right section with sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-[60px] h-[60px] relative mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-1.5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-6">
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
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-sm font-medium">Email</Label>
                <Input
                  id={`${id}-email`}
                  placeholder="Enter your email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id={`${id}-remember`} className="rounded border-gray-300" />
                <Label
                  htmlFor={`${id}-remember`}
                  className="text-sm text-gray-600"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline">
                <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
              <Button variant="outline">
                <RiGithubFill
                  className="me-3 text-[#333333] dark:text-white/60"
                  size={16}
                  aria-hidden="true"
                />
                Sign in with GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
