"use client";

import { PasswordInput } from "@/app/components/ui/PasswordInput";
import { Button } from "@/app/components/ui/signin/button";
import { Input } from "@/app/components/ui/signin/input";
import { Label } from "@/app/components/ui/signin/label";
import {
  resendConfirmationEmail,
  signInWithEmail,
  signInWithOAuth,
} from "@/lib/supabase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { ValidationMessage } from "../components/validation";

export default function SignInPage() {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Use dynamic redirect based on current window origin
  const redirectPath =
    searchParams?.get("redirect") ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/chatpage`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(
    searchParams?.get("message")
      ? { type: "warning", message: searchParams?.get("message")! }
      : null
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  });

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
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

    // Check for field-level validation errors
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasEmailError = !emailRegex.test(email);
    const hasPasswordError = !password;

    // Return early if there are field-level errors
    // These will be shown by the field-specific validation messages
    if (hasEmailError || hasPasswordError) {
      return;
    }

    setFormStatus(null);
    setLoading(true);

    try {
      const { data, error } = await signInWithEmail(
        email,
        password,
        isRememberMe
      );
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = error.message as string;

        if (errorMessage.includes("Email not confirmed")) {
          setFormStatus({
            type: "warning",
            message:
              "Your email address hasn't been verified. Please check your inbox and click the verification link.",
          });
          return;
        } else if (errorMessage.includes("Invalid login credentials")) {
          setFormStatus({
            type: "error",
            message:
              "The email or password you entered is incorrect. Please try again.",
          });
          return;
        } else {
          throw error;
        }
      }

      if (data?.session) {
        // Use absolute URL here for client-side navigation
        if (redirectPath.startsWith("http")) {
          window.location.href = redirectPath;
        } else {
          router.push(redirectPath);
        }
      }
    } catch (err: any) {
      console.error("Signin error:", err);
      setFormStatus({
        type: "error",
        message:
          err.message ||
          "We couldn't sign you in. Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update OAuth sign-in to use absolute URL
  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setFormStatus(null);
    setLoading(true);

    try {
      // For Google auth, always use /chatpage as the path to avoid URL issues
      const finalRedirectPath =
        provider === "google"
          ? "/chatpage" // Use a simple path for Google auth
          : redirectPath;

      console.log(
        `Starting ${provider} auth with redirect to: ${finalRedirectPath}`
      );
      const { error } = await signInWithOAuth(provider, finalRedirectPath);
      if (error) {
        throw new Error(
          `Unable to sign in with ${provider}. Please try again or use another sign-in method.`
        );
      }
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message:
          err.message ||
          `We couldn't complete your ${provider} sign-in. Please try again later.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Used in conditional rendering scenarios
  const handleResendConfirmation = async () => {
    setLoading(true);
    setFormStatus(null);

    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setFormStatus({
        type: "success",
        message: "Confirmation email has been resent. Please check your inbox.",
      });
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message: err.message || "Failed to resend confirmation email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-600 p-4 lg:p-8 overflow-hidden">
        <div className="flex flex-col justify-between text-white max-w-xl w-full h-full">
          <div>
            <h1 className="text-8xl font-bold tracking-tight text-white/90 mt-8">
              Sign-in
            </h1>
          </div>
        </div>

        {/* Instruction content positioned to avoid logo overlap */}
        <div className="absolute top-1/2 right-14 max-w-md space-y-6 text-white/80">
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <div className="space-y-4">
            <p className="text-lg">Unlock the power of Colossus AI:</p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>
                  Transform unstructured documents into clear, AI-powered study
                  roadmaps
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>Extract key insights and organize them efficiently</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>{" "}
                <span>
                  Access step-by-step learning plans for focused studying
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>
                  Collaborate with AI to enhance your learning journey
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Large wheel logo positioned to show only half */}
        <div className="absolute -left-64 bottom-0 w-[500px] h-[500px]">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain logo-rotate"
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-16 lg:w-32 h-16 lg:h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-12 lg:w-24 h-12 lg:h-24 bg-white/10 rounded-full translate-x-1/2"></div>

        {/* Add logo rotation animation */}
        <style jsx global>{`
          .logo-rotate {
            animation: rotate 10s linear infinite;
          }

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>

      {/* Right section with form - UPDATED TO DARK THEME */}
      <div className="w-full lg:w-1/2 form-container dark-theme">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-1.5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500">
                Sign in to continue to your account
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className="w-full flex items-center justify-center gap-2 rounded-3xl h-11 bg-[#2D2D2D] border border-[#444444] text-white hover:bg-[#3a3a3a] transition-colors"
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
              className="w-full flex items-center justify-center gap-2 rounded-3xl h-11 bg-[#2D2D2D] border border-[#444444] text-white hover:bg-[#3a3a3a] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-[#FFFFFF] divider-text">
                Or Continue with email
              </span>
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
                  onBlur={() => handleBlur("email")}
                  className="h-11 rounded-3xl"
                  error={
                    touchedFields.email &&
                    (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
                  }
                />
                {touchedFields.email && !email && (
                  <ValidationMessage type="error" message="Email is required" />
                )}
                {touchedFields.email &&
                  email &&
                  !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                    <ValidationMessage
                      type="error"
                      message="Please enter a valid email address"
                    />
                  )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`${id}-password`}
                  className="text-sm font-medium"
                >
                  Password<span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  id={`${id}-password`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className="h-11 rounded-3xl"
                  error={touchedFields.password && !password}
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
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id={`${id}-remember`}
                    type="checkbox"
                    checked={isRememberMe}
                    onChange={(e) => setIsRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-purple-500 text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <div className="ml-2">
                  <label
                    htmlFor={`${id}-remember`}
                    className="text-sm text-gray-500"
                  >
                    Remember me
                  </label>
                </div>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-500 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-3xl"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="signin-link text-center">
              Don't have an account? <Link href="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
