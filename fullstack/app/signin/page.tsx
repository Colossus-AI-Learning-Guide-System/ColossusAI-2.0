"use client";

import { Button } from "@/components/ui/singin/button";
import { Checkbox } from "@/components/ui/singin/checkbox";
import { Input } from "@/components/ui/singin/input";
import { Label } from "@/components/ui/singin/label";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import Link from "next/link";
import { useId } from "react";

export default function SignInPage() {
  const id = useId();
  return (
    <div className="mx-auto w-full max-w-[400px] space-y-6 rounded-xl border bg-card p-6 shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
          aria-hidden="true"
        >
          <svg
            className="stroke-zinc-800 dark:stroke-zinc-100"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
          </svg>
        </div>
        <div className="space-y-1.5 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to login to your account.
          </p>
        </div>
      </div>

      <form className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              placeholder="hi@yourcompany.com"
              type="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-password`}>Password</Label>
            <Input
              id={`${id}-password`}
              placeholder="Enter your password"
              type="password"
              required
            />
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-remember`} />
            <Label
              htmlFor={`${id}-remember`}
              className="font-normal text-muted-foreground"
            >
              Remember me
            </Label>
          </div>
          <a className="text-sm underline hover:no-underline" href="#">
            Forgot password?
          </a>
        </div>
        <Button type="button" className="w-full">
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or continue with</span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            aria-label="Login with Google"
            className="h-11 w-11"
          >
            <RiGoogleFill size={20} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            aria-label="Login with GitHub"
            className="h-11 w-11"
          >
            <RiGithubFill size={20} aria-hidden="true" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline hover:no-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
