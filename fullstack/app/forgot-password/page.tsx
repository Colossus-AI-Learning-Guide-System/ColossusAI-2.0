"use client";

import { Button } from "@/components/ui/signin/button";
import { Input } from "@/components/ui/signin/input";
import { Label } from "@/components/ui/signin/label";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ValidationMessage } from "../components/validation";

export default function ForgotPasswordPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const RATE_LIMIT_SECONDS = 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTime = useRef<number>(0);

  useEffect(() => {
    // Cleanup function to clear the interval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const startTimer = (duration: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Set initial time
    setTimeRemaining(duration);

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setError(null);
          return 0;
        }
        setError(`You can try again in ${newTime} seconds`);
        return newTime;
      });
    }, 1000);
  };

  const handleRateLimit = (waitTime: number) => {
    setLoading(false);
    startTimer(waitTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Check rate limiting
      const now = Date.now();
      const timeSinceLastRequest = (now - lastRequestTime.current) / 1000;
      
      if (timeSinceLastRequest < RATE_LIMIT_SECONDS) {
        const waitTime = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastRequest);
        handleRateLimit(waitTime);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        throw new Error("Please enter your email address");
      }
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      setLoading(true);

      // Send password reset email
      const { error: resetError } = await sendPasswordResetEmail(email);

      if (resetError) {
        if (resetError instanceof Error) {
          if (resetError.message.toLowerCase().includes("rate limit")) {
            const waitTimeMatch = resetError.message.match(/\d+/);
            const waitTime = parseInt(waitTimeMatch?.[0] || "60", 10);
            handleRateLimit(waitTime);
            return;
          }
        }
        throw resetError;
      }

      // Update last request time on success
      lastRequestTime.current = now;

      // Show success message
      setSuccess(true);
      setSuccessMessage(
        "We've sent password reset instructions to your email. Please check your inbox and follow the link to reset your password."
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        const err = error as { message: string };
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendClick = () => {
    if (timeRemaining > 0) {
      return; // Prevent resend if still in cooldown
    }
    // Clear previous success state when trying again
    setSuccess(false);
    setSuccessMessage(null);
    handleSubmit(new Event('submit') as any);
  };

  // Render the resend button with timer
  const renderResendButton = () => {
    if (loading) {
      return "Sending...";
    }
    if (timeRemaining > 0) {
      return `Try again in ${timeRemaining}s`;
    }
    return "Click to resend";
  };

  return (
    <div className="flex min-h-screen">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B6B] via-[#FF3399] to-[#9933FF] p-12">
        <div className="flex flex-col justify-center text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
          <p className="text-lg opacity-90">Enter your email to receive password reset instructions</p>
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
              <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <ValidationMessage
                type="success"
                message={successMessage || ""}
              />
              <p className="text-sm text-gray-600">
                Didn't receive the email?{" "}
                <button
                  onClick={handleResendClick}
                  className={cn(
                    "text-purple-600 hover:text-purple-500 font-medium",
                    timeRemaining > 0 && "cursor-not-allowed opacity-50"
                  )}
                  disabled={loading || timeRemaining > 0}
                >
                  {renderResendButton()}
                </button>
              </p>
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <ValidationMessage
                  type="error"
                  message={error}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor={`${id}-email`} className="text-sm font-medium">
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${id}-email`}
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-11 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500",
                    error && "border-red-500"
                  )}
                />
                {timeRemaining > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can try again in {timeRemaining} seconds
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-lg"
                disabled={loading || timeRemaining > 0}
              >
                {loading ? "Sending instructions..." : "Send Reset Instructions"}
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
          )}
        </div>
      </div>
    </div>
  );
}