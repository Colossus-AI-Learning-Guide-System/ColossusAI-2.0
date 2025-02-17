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
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
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
        if (signUpError.message?.includes("already exists")) {
          setShowResendButton(true);
          setError(signUpError.message);
          setPassword("");
          return;
        }
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
                  placeholder="Create a password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordTouched(true);
                    setValidationErrors(validatePassword(e.target.value));
                    setError(null);
                  }}
                />
                {isPasswordTouched && (
                  <div className="text-sm space-y-2">
                    <div className="font-medium">Password requirements:</div>
                    <ul className="space-y-1">
                      <li className={password.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                        {password.length >= 8 ? '✓' : '×'} At least 8 characters
                      </li>
                      <li className={/\d/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/\d/.test(password) ? '✓' : '×'} At least one number
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '×'} At least one special character (!@#$%^&*)
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                        {/[A-Z]/.test(password) ? '✓' : '×'} At least one uppercase letter
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
                <Input
                  id={`${id}-confirm-password`}
                  placeholder="Confirm your password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className={error && error.includes("don't match") ? 'border-red-500' : ''}
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
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (isPasswordTouched && validationErrors.length > 0)}
            >
              {loading ? "Creating account..." : "Create account"}
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
