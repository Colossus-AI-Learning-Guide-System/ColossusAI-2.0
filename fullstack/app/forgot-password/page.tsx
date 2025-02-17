"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export default function ForgotPasswordPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const lastRequestTime = useRef<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const RATE_LIMIT_SECONDS = 60;

  // Add countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setError(null); // Clear error when timer expires
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeRemaining]);

  const handleRateLimit = (waitTime: number) => {
    setError(`You can try again in ${waitTime} seconds`);
    setLoading(false);

    // Start countdown
    const interval = setInterval(() => {
      setError((current) => {
        if (!current) return null;
        const timeLeft = parseInt(current.match(/\d+/)?.[0] || "0") - 1;
        if (timeLeft <= 0) {
          clearInterval(interval);
          return null;
        }
        return `You can try again in ${timeLeft} seconds`;
      });
    }, 1000);
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
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="text-green-600 font-medium">{successMessage}</div>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <button
              onClick={handleResendClick}
              className={`text-primary underline hover:no-underline ${
                timeRemaining > 0 ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={loading || timeRemaining > 0}
            >
              {renderResendButton()}
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
                {timeRemaining > 0 && (
                  <div className="mt-1 text-xs">
                    You can try again in {timeRemaining} seconds
                  </div>
                )}
              </div>
            )}
            <div className="space-y-4">
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
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || timeRemaining > 0}
            >
              {loading ? "Sending..." : "Send reset instructions"}
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
        </>
      )}
    </div>
  );
}
