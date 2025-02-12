"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate email
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      // Send password reset email
      const { error: resetError } = await sendPasswordResetEmail(email);

      if (resetError) {
        throw resetError;
      }

      // Show success message
      setSuccess(true);
      setSuccessMessage(
        "Password reset instructions have been sent to your email. Please check your inbox."
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send reset instructions"
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
              onClick={handleSubmit}
              className="text-primary underline hover:no-underline"
              disabled={loading}
            >
              Click to resend
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
              <div className="text-sm text-red-500 text-center">{error}</div>
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
            <Button type="submit" className="w-full" disabled={loading}>
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
