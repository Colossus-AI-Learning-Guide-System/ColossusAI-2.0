"use client";

import { Checkbox } from "@/components/ui/signin/checkbox";
import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import {
  resendConfirmationEmail,
  signInWithOAuth,
  signUpWithEmail,
} from "@/lib/supabase/auth";
import { RiGithubFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export default function SignUpPage() {
  const id = useId();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/\d/.test(password)) {
      errors.push("At least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("At least one special character");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("At least one uppercase letter");
    }
    return errors;
  };

  const validateFullName = (name: string) => {
    const errors = [];
    const nameParts = name.trim().split(/\s+/);
    
    // Check for minimum two parts (first and last name)
    if (nameParts.length < 2) {
      errors.push("Please enter both your first and last name");
    }

    // Check for numbers and special characters
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(name)) {
      errors.push("Name should not contain numbers or special characters");
    }

    // Check each part length
    if (nameParts.some(part => part.length < 2)) {
      errors.push("Each name part should be at least 2 characters long");
    }

    return errors;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowResendButton(false);

    try {
      // Validate full name
      if (!fullName.trim()) {
        setError("Please enter your full name");
        return;
      }

      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        setError("Please enter both your first and last name");
        return;
      }

      // Check for numbers and special characters in name
      if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(fullName)) {
        setError("Name should not contain numbers or special characters");
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        setError("Please enter your email address");
        return;
      }
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Validate password
      if (!password.trim()) {
        setError("Please enter your password");
        return;
      }

      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        setValidationErrors(passwordErrors);
        return;
      }

      // Validate password confirmation
      if (!confirmPassword.trim()) {
        setError("Please confirm your password");
        return;
      }
      if (password !== confirmPassword) {
        setError("The passwords you entered don't match. Please try again.");
        return;
      }

      // Attempt to sign up
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (signUpError) {
        const errorMessage = (signUpError as { message?: string }).message;
        if (errorMessage?.includes("already exists")) {
          setShowResendButton(true);
          setError(errorMessage);
          setPassword("");
          return;
        }
        // Fallback for when message is not available
        setError(errorMessage || 'An unknown error occurred during sign up.');
        throw signUpError;
      }

      if (!data?.user) {
        setError("Account creation failed. Please try again.");
        return;
      }

      // Success
      setSuccess(true);
      setSuccessMessage(
        "Please check your email for a confirmation link to complete your registration."
      );

    } catch (err: any) {
      const errorDetails = {
        type: 'SIGNUP_ERROR',
        message: err.message || 'Unknown error occurred',
        code: err.code || 'UNKNOWN',
        details: err.details || {},
        context: {
          email,
          hasPassword: !!password,
          hasFullName: !!fullName,
        },
        timestamp: new Date().toISOString()
      };

      console.error("Sign up error:", errorDetails);
      
      const userMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred during sign up. Please try again later.";
      
      setError(userMessage);
      
      if (userMessage.includes("already exists")) {
        setPassword("");
        setShowResendButton(true);
      }
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
    <div className="flex min-h-screen">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B6B] via-[#FF3399] to-[#9933FF] p-12">
        <div className="flex flex-col justify-center text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">WELCOME</h1>
          <p className="text-lg opacity-90">Create your account and start your journey with ColossusAI</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2"></div>
      </div>

      {/* Right section with sign up form */}
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
              <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to create your account
              </p>
            </div>
          </div>

          {/* OAuth Buttons - Placed before the form for better visibility */}
          <div className="space-y-4">
          <div className="flex justify-center gap-4 text-gray-600">
              <Button variant="outline">
                <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button variant="outline">
                <RiGithubFill
                  className="me-3"
                  size={16}
                  aria-hidden="true"
                />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-6">
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
            {successMessage && (
              <div className="text-sm text-green-500 text-center bg-green-50 p-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${id}-fullname`} className="text-sm font-medium">Full Name</Label>
                <Input
                  id={`${id}-fullname`}
                  placeholder="John Doe"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-sm font-medium">Email</Label>
                <Input
                  id={`${id}-email`}
                  placeholder="you@example.com"
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
                  placeholder="Create a password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordTouched(true);
                    setValidationErrors(validatePassword(e.target.value));
                  }}
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                {isPasswordTouched && validationErrors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-500 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-confirm-password`} className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id={`${id}-confirm-password`}
                  placeholder="Confirm your password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id={`${id}-terms`} className="rounded border-gray-300" required />
              <Label htmlFor={`${id}-terms`} className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
