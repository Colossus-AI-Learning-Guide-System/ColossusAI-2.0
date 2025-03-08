"use client";

import { Button } from "@/app/components/ui/signin/button";
import { Input } from "@/app/components/ui/signin/input";
import { Label } from "@/app/components/ui/signin/label";
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

  // Helper function to show only the first failing password requirement
  const getFailingRequirementMessage = () => {
    if (!password) return null;
    
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/\d/.test(password)) {
      return "Password must include at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must include at least one special character.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }
    return null;
  };

  // Used in conditional contexts for rendering password requirements
  const renderPasswordRequirements = () => {
    // Only show requirements if password is touched and there are validation errors
    if (!isPasswordTouched || validationErrors.length === 0) return null;

    return (
      <div className="text-xs text-red-500 flex items-center gap-3 mt-1">
        <span>Password requirements:</span>
        <div className="flex items-center gap-3">
          {[
            { text: "8+ chars", test: (p: string) => p.length >= 8 },
            { text: "1 number", test: (p: string) => /\d/.test(p) },
            { text: "1 special char", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
            { text: "1 uppercase", test: (p: string) => /[A-Z]/.test(p) }
          ].map((req, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-1",
                req.test(password) ? "text-green-500" : "text-red-500"
              )}
            >
              <span>{req.test(password) ? "✓" : "×"}</span>
              <span>{req.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-600 p-4 lg:p-8 overflow-hidden">
        <div className="flex flex-col justify-between text-white max-w-xl w-full h-full">
          <div>
            <h1 className="text-8xl font-bold tracking-tight text-white/90 mt-8">Reset Password</h1>
          </div>
        </div>
        
        {/* Instruction content positioned to avoid logo overlap */}
        <div className="absolute top-1/2 right-14 max-w-md space-y-6 text-white/80">
          <h2 className="text-2xl font-semibold">Create a New Password</h2>
          <div className="space-y-4">
            <p className="text-lg">Tips for a strong, secure password:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 mr-3 text-sm">🔒</span>
                <span>Use at least 8 characters</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 mr-3 text-sm">🔒</span>
                <span>Include uppercase and lowercase letters</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 mr-3 text-sm">🔒</span>
                <span>Add numbers and special characters</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 mr-3 text-sm">🔒</span>
                <span>Avoid using personal information</span>
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
              <div>
                <Label htmlFor={`${id}-password`} className="text-sm font-medium">
                  New Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-password`}
                    placeholder="Enter your new password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setIsPasswordTouched(true)}
                    className="h-11 rounded-3xl"
                    error={validationErrors.length > 0 && isPasswordTouched}
                  />
                  <div className="min-h-[20px] mt-1">
                    {isPasswordTouched && password && getFailingRequirementMessage() && (
                      <p className="text-xs text-red-500">
                        {getFailingRequirementMessage()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`${id}-confirm-password`} className="text-sm font-medium">
                  Confirm New Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-confirm-password`}
                    placeholder="Confirm your new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    className="h-11 rounded-3xl"
                    error={!!(error && error.includes("match")) || !!(confirmPassword && password !== confirmPassword)}
                  />
                  <div className="min-h-[20px] mt-1">
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">
                        Please re-enter your password for confirmation.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-3xl"
              disabled={loading || (isPasswordTouched && validationErrors.length > 0)}
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </Button>

            <p className="signin-link text-center">
              Remember your password?{" "}
              <Link href="/signin">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
