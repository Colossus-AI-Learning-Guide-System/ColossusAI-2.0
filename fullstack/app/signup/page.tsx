"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
import { signUpWithEmail, signInWithOAuth } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const id = useId();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await signUpWithEmail(email, password, fullName);
      if (error) throw error;

      // If we have a session, redirect to dashboard
      if (data?.session) {
        router.push("/dashboard");
      } else {
        throw new Error("Failed to create account");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.message.includes("unique constraint")) {
        setError("An account with this email already exists");
      } else {
        setError(err.message || "An error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "github" | "google") => {
    setError(null);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
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
              placeholder="Enter your password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </form>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or continue with</span>
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
          <p className="text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline hover:no-underline">
              Terms
            </Link>
            .
          </p>
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
    </div>
  );
}
