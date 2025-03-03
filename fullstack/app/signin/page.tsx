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
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { ValidationMessage } from "../components/validation";

export default function SignInPage() {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(
    searchParams.get("message") 
      ? { type: 'warning', message: searchParams.get("message")! }
      : null
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  });

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedFields({
      email: true,
      password: true,
    });

    // Validate all required fields
    if (!email || !password) {
      setFormStatus({
        type: 'error',
        message: "Please fill in all required fields"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus({
        type: 'error',
        message: "Please enter a valid email address"
      });
      return;
    }

    setFormStatus(null);
    setLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        
        if (errorMessage.includes("Email not confirmed")) {
          setFormStatus({
            type: 'warning',
            message: "Your email address hasn't been verified. Please check your inbox and click the verification link."
          });
          return;
        } else if (errorMessage.includes("Invalid login credentials")) {
          setFormStatus({
            type: 'error',
            message: "The email or password you entered is incorrect. Please try again."
          });
          return;
        } else {
          throw error;
        }
      }

      if (data?.session) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Signin error:", err);
      setFormStatus({
        type: 'error',
        message: err.message || "We couldn't sign you in. Please check your credentials and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setFormStatus(null);
    setLoading(true);
    
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        throw new Error(
          `Unable to sign in with ${provider}. Please try again or use another sign-in method.`
        );
      }
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || `We couldn't complete your ${provider} sign-in. Please try again later.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setFormStatus(null);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setFormStatus({
        type: 'success',
        message: "Confirmation email has been resent. Please check your inbox."
      });
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || "Failed to resend confirmation email"
      });
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
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or Continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-6" noValidate>
            {formStatus && (
              <ValidationMessage
                type={formStatus.type}
                message={formStatus.message}
              />
            )}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-sm font-medium">
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${id}-email`}
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={cn(
                    "h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    touchedFields.email && !email && "border-red-500"
                  )}
                />
                {touchedFields.email && !email && (
                  <ValidationMessage
                    type="error"
                    message="Email is required"
                  />
                )}
                {touchedFields.email && email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                  <ValidationMessage
                    type="error"
                    message="Please enter a valid email address"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-password`} className="text-sm font-medium">
                  Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${id}-password`}
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={cn(
                    "h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    touchedFields.password && !password && "border-red-500"
                  )}
                />
                {touchedFields.password && !password && (
                  <ValidationMessage
                    type="error"
                    message="Password is required"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`${id}-remember`} 
                  className="rounded border-gray-300"
                  checked={isRememberMe}
                  onCheckedChange={(checked) => setIsRememberMe(checked as boolean)}
                />
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
