"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import { resetPassword } from "@/lib/supabase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { RiLockFill } from "react-icons/ri";

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
        // Type assertion to inform TypeScript about the error structure
        const errorMessage = (resetError as { message?: string }).message;

        // Handle specific API errors
        if (errorMessage?.toLowerCase().includes("invalid")) {
          setError("The password reset link has expired. Please request a new one.");
          router.push('/forgot-password');
          return;
        }
        
        // Handle same password error
        if (errorMessage?.toLowerCase().includes("different from the old password")) {
          setError("Your new password must be different from your current password.");
          setPassword("");
          setConfirmPassword("");
          setIsPasswordTouched(false);
          setValidationErrors([]);
          return;
        }
        
        // Handle other errors
        setError(errorMessage || "An error occurred while resetting your password");
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
      <p className="text-muted-foreground">Password requirements:</p>
      <ul className="space-y-1">
        {[
          { text: "At least 8 characters", test: (p: string) => p.length >= 8 },
          { text: "At least one number", test: (p: string) => /\d/.test(p) },
          { text: "At least one special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
          { text: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) }
        ].map((req, index) => (
          <li 
            key={index}
            className={`flex items-center gap-2 ${
              isPasswordTouched 
                ? req.test(password)
                  ? "text-green-600"
                  : "text-red-500"
                : "text-muted-foreground"
            }`}
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
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-password`}>New Password</Label>
            <Input
              id={`${id}-password`}
              placeholder="Enter your new password"
              type="password"
              required
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setIsPasswordTouched(true)}
              className={validationErrors.length > 0 && isPasswordTouched ? 'border-red-500' : ''}
            />
            {renderPasswordRequirements()}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
            <Input
              id={`${id}-confirm-password`}
              placeholder="Confirm your new password"
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
        <Button
          variant="outline"
          className="w-full h-11 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 bg-white"
          onClick={handleSubmit}
          disabled={loading || (isPasswordTouched && validationErrors.length > 0)}
        >
          <RiLockFill size={24} />
          <span>Reset Password</span>
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="text-primary underline hover:no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
