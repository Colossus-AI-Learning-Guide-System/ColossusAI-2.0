"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
import { resetPassword } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const id = useId();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate passwords
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Update password
      const { error: resetError } = await resetPassword(password);

      if (resetError) {
        throw resetError;
      }

      // Redirect to sign in page on success
      router.push(
        "/signin?message=Password reset successful. Please sign in with your new password."
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password");
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
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
            <Input
              id={`${id}-confirm-password`}
              placeholder="Confirm your new password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
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
