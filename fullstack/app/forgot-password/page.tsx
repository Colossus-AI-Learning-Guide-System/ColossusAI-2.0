"use client";

import { Button } from "@/app/components/ui/signin/button";
import { Input } from "@/app/components/ui/signin/input";
import { Label } from "@/app/components/ui/signin/label";
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
    <div className="flex h-screen w-full">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-600 p-4 lg:p-8 overflow-hidden">
        <div className="flex flex-col justify-between text-white max-w-xl w-full h-full">
          <div>
            <h1 className="text-8xl font-bold tracking-tight text-white/90 mt-8">Forgot Password</h1>
          </div>
        </div>
        
        {/* Instruction content positioned to avoid logo overlap */}
        <div className="absolute top-1/2 right-14 max-w-md space-y-6 text-white/80">
          <h2 className="text-2xl font-semibold">Password Recovery</h2>
          <div className="space-y-4">
            <p className="text-lg">Follow these simple steps to reset your password:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">✓</span>
                <span>Enter your email address</span>
              </li>
              <li className="flex items-center">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">✓</span>
                <span>Check your inbox for a reset link</span>
              </li>
              <li className="flex items-center">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">✓</span>
                <span>Create a new secure password</span>
              </li>
              <li className="flex items-center">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">✓</span>
                <span>Log in with your new credentials</span>
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
              <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center bg-[#1A1A1A] backdrop-blur-sm p-6 rounded-3xl border-2 border-[#333333] shadow-sm space-y-6">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-[#182812] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-medium text-white">Check Your Email</h2>
              <p className="text-sm text-[#E0E0E0] max-w-sm mx-auto">
                {successMessage || "We&apos;ve sent password reset instructions to your email."}
              </p>
              <div className="pt-2 border-t border-[#333333]">
                <p className="text-sm text-[#E0E0E0] mb-4">
                  Didn&apos;t receive the email?
                </p>
                <button
                  onClick={handleResendClick}
                  className={cn(
                    "w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white font-medium rounded-3xl transition-colors",
                    timeRemaining > 0 && "cursor-not-allowed opacity-50"
                  )}
                  disabled={loading || timeRemaining > 0}
                >
                  {renderResendButton()}
                </button>
              </div>
              <p className="signin-link text-center mt-4">
                Remember your password?{" "}
                <Link href="/signin">
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
                  className="h-11 rounded-3xl"
                  error={!!error}
                />
                {timeRemaining > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can try again in {timeRemaining} seconds
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-3xl"
                disabled={loading || timeRemaining > 0}
              >
                {loading ? "Sending instructions..." : "Send Reset Instructions"}
              </Button>

              <p className="signin-link text-center">
                Remember your password?{" "}
                <Link href="/signin">
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