"use client";

import { Button } from "@/components/ui/signup/button";
import { Input } from "@/components/ui/signup/input";
import { Label } from "@/components/ui/signup/label";
import {
  resendConfirmationEmail,
  signInWithOAuth,
  signUpWithEmail,
} from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import { RiGithubFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { TermsModal } from "../components/PrivacyModal";
import { TermsOfServiceModal } from "../components/TermsModal";
import { ValidationMessage } from "../components/validation";

export default function SignUpPage() {
  const id = useId();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isFullNameTouched, setIsFullNameTouched] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Password validation requirements
  const passwordRequirements = [
    "At least 8 characters long",
    "Contains at least one uppercase letter",
    "Contains at least one lowercase letter",
    "Contains at least one number",
    "Contains at least one special character",
  ];

  // Name validation requirements
  const nameRequirements = [
    "At least 2 characters long",
    "Contains only letters and spaces",
    "First and last name required",
  ];

  // State for tracking valid requirements
  const [validPasswordRequirements, setValidPasswordRequirements] = useState<string[]>([]);
  const [validNameRequirements, setValidNameRequirements] = useState<string[]>([]);

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setIsFullNameTouched(true);
    
    const valid: string[] = [];
    if (value.length >= 2) valid.push("At least 2 characters long");
    if (/^[A-Za-z\s]+$/.test(value)) valid.push("Contains only letters and spaces");
    if (value.trim().split(/\s+/).length >= 2) valid.push("First and last name required");
    
    setValidNameRequirements(valid);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordTouched(true);
    
    const valid: string[] = [];
    if (value.length >= 8) valid.push("At least 8 characters long");
    if (/[A-Z]/.test(value)) valid.push("Contains at least one uppercase letter");
    if (/[a-z]/.test(value)) valid.push("Contains at least one lowercase letter");
    if (/[0-9]/.test(value)) valid.push("Contains at least one number");
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) valid.push("Contains at least one special character");
    
    setValidPasswordRequirements(valid);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailTouched(true);
  };

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    // Validate all required fields
    if (!fullName || !email || !password || !confirmPassword || !isTermsAccepted) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus({
        type: 'error',
        message: "Please enter a valid email address"
      });
      return;
    }

    setLoading(true);
    setFormStatus(null);

    // Validation checks
    if (validPasswordRequirements.length < passwordRequirements.length) {
      setFormStatus({
        type: 'error',
        message: "Please ensure all password requirements are met"
      });
      setLoading(false);
      return;
    }

    if (validNameRequirements.length < nameRequirements.length) {
      setFormStatus({
        type: 'error',
        message: "Please ensure all name requirements are met"
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormStatus({
        type: 'error',
        message: "Passwords do not match"
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (signUpError) {
        // Handle specific Supabase auth errors
        if (signUpError instanceof Error) {
          const errorMessage = signUpError.message;
          
          // Handle specific error cases
          if (errorMessage.includes("already exists")) {
            setFormStatus({
              type: 'error',
              message: "An account with this email already exists. Please sign in instead."
            });
          } else if (errorMessage.includes("invalid email")) {
            setFormStatus({
              type: 'error',
              message: "The email address format is invalid. Please check and try again."
            });
          } else if (errorMessage.includes("weak password")) {
            setFormStatus({
              type: 'error',
              message: "The password is too weak. Please ensure it meets all requirements."
            });
          } else {
            setFormStatus({
              type: 'error',
              message: errorMessage || 'An error occurred during sign up. Please try again.'
            });
          }
        } else {
          setFormStatus({
            type: 'error',
            message: 'An unexpected error occurred. Please try again later.'
          });
        }
        
        // Check if signUpError has a message property before accessing it
        const errorObj = signUpError as { message?: string };
        if (errorObj.message && errorObj.message.includes("already exists")) {
          setPassword("");
        }
        
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setFormStatus({
          type: 'error',
          message: "Account creation failed. Please try again."
        });
        setLoading(false);
        return;
      }

      setFormStatus({
        type: 'success',
        message: "Please check your email for a confirmation link to complete your registration."
      });

    } catch (err: any) {
      console.error("Sign up error:", err);
      
      // Handle AuthError, AuthApiError and other errors
      let errorMessage = "An unexpected error occurred during sign up. Please try again later.";
      
      if (err instanceof Error) {
        // Check for specific error types in the error name or message
        if (err.name === "AuthError" || err.name === "AuthApiError") {
          if (err.message.includes("invalid email")) {
            errorMessage = "The email address format is invalid. Please check and try again.";
          } else if (err.message.includes("already exists")) {
            errorMessage = "An account with this email already exists. Please sign in instead.";
          } else {
            errorMessage = err.message;
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      setFormStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "github" | "google") => {
    setFormStatus(null);
    setLoading(true);

    try {
      const { error: oauthError } = await signInWithOAuth(provider);
      if (oauthError) {
        throw new Error(
          typeof oauthError === "object" && oauthError !== null
            ? (oauthError as { message?: string }).message ||
              `Failed to sign up with ${provider}`
            : `Failed to sign up with ${provider}`
        );
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setFormStatus({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : `Failed to sign up with ${provider}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) throw error;
      setFormStatus({
        type: 'success',
        message: "Confirmation email has been resent. Please check your inbox."
      });
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : "Failed to resend confirmation email"
      });
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

  // Helper function for most relevant email validation message
  const getEmailValidationMessage = () => {
    if (!email) return null;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B6B] via-[#FF3399] to-[#9933FF] p-12">
        <div className="flex flex-col justify-center text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">WELCOME</h1>
          <p className="text-lg opacity-90">Create your account and start your journey with ColossusAI</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2"></div>
      </div>

      {/* Right section with sign up form */}
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
              <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to create your account
              </p>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleOAuthSignUp("google")}
                className="w-full flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleOAuthSignUp("github")}
                className="w-full flex items-center justify-center gap-2"
              >
                <RiGithubFill
                  className="me-3"
                  size={16}
                  aria-hidden="true"
                />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-6" noValidate>
            {formStatus && (
              <ValidationMessage
                type={formStatus.type}
                message={formStatus.message}
              />
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor={`${id}-fullname`} className="text-xs font-medium">
                  Full Name<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-fullname`}
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={handleFullNameChange}
                    onBlur={() => handleBlur('fullName')}
                    className={cn(
                      "h-9 text-sm",
                      touchedFields.fullName && !fullName && "border-red-500"
                    )}
                  />
                  <div className="min-h-[20px] mt-1">
                    {touchedFields.fullName && !fullName && (
                      <p className="text-xs text-red-500">
                        Full name is required
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`${id}-email`} className="text-xs font-medium">
                  Email<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-email`}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    className={cn(
                      "h-9 text-sm",
                      touchedFields.email && !email && "border-red-500"
                    )}
                  />
                  <div className="min-h-[20px] mt-1">
                    {touchedFields.email && !email && (
                      <p className="text-xs text-red-500">
                        Email is required
                      </p>
                    )}
                    {touchedFields.email && email && getEmailValidationMessage() && (
                      <p className="text-xs text-red-500">
                        {getEmailValidationMessage()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`${id}-password`} className="text-xs font-medium">
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-password`}
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    className={cn(
                      "h-9 text-sm",
                      touchedFields.password && !password && "border-red-500"
                    )}
                  />
                  <div className="min-h-[20px] mt-1">
                    {touchedFields.password && !password && (
                      <p className="text-xs text-red-500">
                        Password is required
                      </p>
                    )}
                    {touchedFields.password && password && getFailingRequirementMessage() && (
                      <p className="text-xs text-red-500">
                        {getFailingRequirementMessage()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`${id}-confirm-password`} className="text-xs font-medium">
                  Confirm Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-confirm-password`}
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={cn(
                      "h-9 text-sm",
                      touchedFields.confirmPassword && !confirmPassword && "border-red-500"
                    )}
                  />
                  <div className="min-h-[20px] mt-1">
                    {touchedFields.confirmPassword && !confirmPassword && (
                      <p className="text-xs text-red-500">
                        Please confirm your password
                      </p>
                    )}
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`${id}-terms`}
                    name={`${id}-terms`}
                    type="checkbox"
                    checked={isTermsAccepted}
                    onChange={(e) => {
                      setIsTermsAccepted(e.target.checked);
                      setTouchedFields(prev => ({ ...prev, terms: true }));
                    }}
                    className="w-4 h-4 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`${id}-terms`} className="text-gray-700">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-purple-600 hover:underline"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="text-purple-600 hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>
              {touchedFields.terms && !isTermsAccepted && (
                <div className="min-h-[20px] mt-1">
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>You must accept the Terms of Service and Privacy Policy</span>
                  </p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modals */}
      <TermsOfServiceModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
      <TermsModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </div>
  );
}
