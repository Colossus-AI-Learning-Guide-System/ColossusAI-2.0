"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
import { useId } from "react";

export default function SignUpPage() {
  const id = useId();
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

      <form className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Full name</Label>
            <Input
              id={`${id}-name`}
              placeholder="Matt Welsh"
              type="text"
              required
            />
          </div>
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
        <Button type="button" className="w-full">
          Sign up
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
          >
            <RiGoogleFill size={20} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            aria-label="Sign up with GitHub"
            className="h-11 w-11"
          >
            <RiGithubFill size={20} aria-hidden="true" />
          </Button>
        </div>

        <div className="space-y-2 text-center text-sm">
          <p className="text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <a className="underline hover:no-underline" href="#">
              Terms
            </a>
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
