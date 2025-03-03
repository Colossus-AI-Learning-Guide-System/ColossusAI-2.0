"use client";

import { Button } from "@/components/ui/signin/button";
import { Input } from "@/components/ui/signin/input";
import { Label } from "@/components/ui/signin/label";
import { resetPassword } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ValidationMessage } from "../components/validation";

export default function ResetPasswordPage() {
  const id = useId();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  // Password validation helper
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

  // Real-time password validation
  useEffect(() => {
    if (isPasswordTouched) {
      const errors = validatePassword(password);
      setValidationErrors(errors);
    }
  }, [password, isPasswordTouched]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsPasswordTouched(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate password
      if (!password.trim()) {
        setError("Please enter your new password");
        return;
      }

      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        setValidationErrors(passwordErrors);
        return;
      }

      // Validate password confirmation
      if (!confirmPassword.trim()) {
        setError("Please confirm your new password");
        return;
      }
      if (password !== confirmPassword) {
        setError("The passwords you entered don't match. Please try again.");
        return;
      }

      setLoading(true);

      // Update password
      const { error: resetError } = await resetPassword(password);

      if (resetError) {
        const errorMessage = resetError instanceof Error 
          ? resetError.message 
          : typeof resetError === 'object' && resetError !== null && 'message' in resetError
            ? String(resetError.message)
            : "An error occurred while resetting your password";

        // Handle specific API errors
        if (errorMessage.toLowerCase().includes("invalid")) {
          setError("The password reset link has expired. Please request a new one.");
          router.push('/forgot-password');
          return;
        }
        
        // Handle same password error
        if (errorMessage.toLowerCase().includes("different from the old password")) {
          setError("Your new password must be different from your current password.");
          setPassword("");
          setConfirmPassword("");
          setIsPasswordTouched(false);
          setValidationErrors([]);
          return;
        }
        
        // Handle other errors
        setError(errorMessage);
        return;
      }

      // Success - redirect to sign in
      router.push(
        "/signin?message=Your password has been reset successfully. Please sign in with your new password."
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "We couldn't reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show password requirements with validation status
  const renderPasswordRequirements = () => (
    <div className="text-xs space-y-2 mt-2">
      <p className="text-gray-500">Password requirements:</p>
      <ul className="space-y-1">
        {[
          { text: "At least 8 characters", test: (p: string) => p.length >= 8 },
          { text: "At least one number", test: (p: string) => /\d/.test(p) },
          { text: "At least one special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
          { text: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) }
        ].map((req, index) => (
          <li 
            key={index}
            className={cn(
              "flex items-center gap-2",
              isPasswordTouched 
                ? req.test(password)
                  ? "text-green-600"
                  : "text-red-500"
                : "text-gray-500"
            )}
          >
            {isPasswordTouched && (
              <span>
                {req.test(password) ? "✓" : "×"}
              </span>
            )}
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B6B] via-[#FF3399] to-[#9933FF] p-12">
        <div className="flex flex-col justify-center text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
          <p className="text-lg opacity-90">Create a new password for your account</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2"></div>
      </div>

      {/* Right section with form */}
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
              <h1 className="text-2xl font-semibold tracking-tight">Create New Password</h1>
              <p className="text-sm text-gray-500">
                Please enter your new password below
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <ValidationMessage
                type="error"
                message={error}
              />
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${id}-password`} className="text-sm font-medium">
                  New Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${id}-password`}
                  placeholder="Enter your new password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordTouched(true)}
                  className={cn(
                    "h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    validationErrors.length > 0 && isPasswordTouched && "border-red-500"
                  )}
                />
                {renderPasswordRequirements()}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-confirm-password`} className="text-sm font-medium">
                  Confirm New Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${id}-confirm-password`}
                  placeholder="Confirm your new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    "h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    error && error.includes("match") && "border-red-500"
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-lg"
              disabled={loading || (isPasswordTouched && validationErrors.length > 0)}
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
