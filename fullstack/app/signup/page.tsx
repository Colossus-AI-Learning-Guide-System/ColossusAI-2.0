"use client";

import { PasswordInput } from "@/app/components/ui/PasswordInput";
import { Button } from "@/app/components/ui/signup/button";
import { Input } from "@/app/components/ui/signup/input";
import { Label } from "@/app/components/ui/signup/label";
import {
  resendConfirmationEmail,
  signInWithOAuth,
  signUpWithEmail,
} from "@/lib/supabase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useId, useState } from "react";
import OTPVerification from "../components/OTPVerification";
import { TermsModal } from "../components/PrivacyModal";
import { TermsOfServiceModal } from "../components/TermsModal";
import { ValidationMessage } from "../components/validation";

export default function SignUpPage() {
  const id = useId();
  const _router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [_isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [_isEmailTouched, setIsEmailTouched] = useState(false);
  const [_isFullNameTouched, setIsFullNameTouched] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

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
  const [validPasswordRequirements, setValidPasswordRequirements] = useState<
    string[]
  >([]);
  const [validNameRequirements, setValidNameRequirements] = useState<string[]>(
    []
  );

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setIsFullNameTouched(true);

    const valid: string[] = [];
    if (value.length >= 2) valid.push("At least 2 characters long");
    if (/^[A-Za-z\s]+$/.test(value))
      valid.push("Contains only letters and spaces");
    if (value.trim().split(/\s+/).length >= 2)
      valid.push("First and last name required");

    setValidNameRequirements(valid);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordTouched(true);

    const valid: string[] = [];
    if (value.length >= 8) valid.push("At least 8 characters long");
    if (/[A-Z]/.test(value))
      valid.push("Contains at least one uppercase letter");
    if (/[a-z]/.test(value))
      valid.push("Contains at least one lowercase letter");
    if (/[0-9]/.test(value)) valid.push("Contains at least one number");
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value))
      valid.push("Contains at least one special character");

    setValidPasswordRequirements(valid);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailTouched(true);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    // Check passwords match
    if (password !== confirmPassword) {
      setFormStatus({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    // Check for empty required fields only at the form level
    // Field-specific validations (like invalid email format) will show at field level
    let formIsValid = true;

    // Check if the form is valid (this will NOT set any global error messages)
    if (
      !fullName ||
      !email ||
      !password ||
      !isTermsAccepted ||
      getNameValidationMessage() ||
      getEmailValidationMessage() ||
      getFailingRequirementMessage()
    ) {
      formIsValid = false;
    }

    // If the form is not valid, return without setting a global error message
    // (field-level messages will be shown)
    if (!formIsValid) {
      return;
    }

    // If we reached here, the form is valid, proceed with signup
    setLoading(true);
    setFormStatus(null);

    try {
      const { error: signUpError } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (signUpError) {
        throw new Error(
          typeof signUpError === "object" && signUpError !== null
            ? (signUpError as { message?: string }).message ||
              "Failed to sign up"
            : "Failed to sign up"
        );
      }

      // Show OTP verification instead of success message
      setShowOTPVerification(true);
    } catch (err) {
      console.error("Sign up error:", err);
      setFormStatus({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "github" | "google") => {
    setFormStatus(null);
    setLoading(true);

    try {
      // Add dynamic redirect URL based on current window origin
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/chatpage`
          : "/chatpage";
      const { error: oauthError } = await signInWithOAuth(
        provider,
        redirectUrl
      );
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
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : `Failed to sign up with ${provider}`,
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
        type: "success",
        message: "Confirmation email has been resent. Please check your inbox.",
      });
    } catch (err) {
      setFormStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to resend confirmation email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    // User has successfully verified their email
    setFormStatus({
      type: "success",
      message: "Registration complete! Redirecting to login...",
    });

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/signin";
    }, 2000);
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

  // Function to get specific name validation error message
  const getNameValidationMessage = () => {
    if (!fullName) return "Full name is required";

    if (fullName.length < 2) return "Name must be at least 2 characters long";
    if (!/^[A-Za-z\s]+$/.test(fullName))
      return "Name must contain only letters and spaces";
    if (fullName.trim().split(/\s+/).length < 2)
      return "Please provide both first and last name";

    return "";
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left section with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-600 p-4 lg:p-8 overflow-hidden">
        <div className="flex flex-col justify-between text-white max-w-xl w-full h-full">
          <div>
            <h1 className="text-7xl lg:text-8xl font-bold tracking-tight text-white/90 mt-8">
              Sign-up
            </h1>
          </div>
        </div>

        {/* Instruction content positioned to avoid logo overlap */}
        <div className="absolute top-1/2 right-14 max-w-md space-y-6 text-white/80">
          <h2 className="text-2xl font-semibold">Welcome to Colossus AI</h2>
          <div className="space-y-4">
            <p className="text-lg">Create your account in just a few steps:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>Fill in your personal information</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>Create a secure password</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>Verify your email address</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 text-sm mt-0.5">
                  ✓
                </span>
                <span>Start exploring the power of AI</span>
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

      {/* Right section with sign up form */}
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
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create Account
              </h1>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleOAuthSignUp("google")}
                className="w-full flex items-center justify-center gap-2 rounded-3xl h-11 bg-[#2D2D2D] border border-[#444444] text-white hover:bg-[#3a3a3a] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignUp("github")}
                className="w-full flex items-center justify-center gap-2 rounded-3xl h-11 bg-[#2D2D2D] border border-[#444444] text-white hover:bg-[#3a3a3a] transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#444444]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-[#121212]">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {showOTPVerification ? (
            <OTPVerification
              email={email}
              onVerificationComplete={handleVerificationComplete}
            />
          ) : (
            <form
              onSubmit={handleEmailSignUp}
              className="space-y-3 mt-3"
              noValidate
            >
              {formStatus && (
                <div className="min-h-validation">
                  <ValidationMessage
                    type={formStatus.type}
                    message={formStatus.message}
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`${id}-fullName`}
                    className="text-sm font-medium"
                  >
                    Full Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-fullName`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={handleFullNameChange}
                    onBlur={() => handleBlur("fullName")}
                    required
                    error={
                      touchedFields.fullName && !!getNameValidationMessage()
                    }
                  />
                  {touchedFields.fullName && !!getNameValidationMessage() && (
                    <div className="min-h-validation">
                      <ValidationMessage
                        type="error"
                        message={getNameValidationMessage()}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`${id}-email`}
                    className="text-sm font-medium"
                  >
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${id}-email`}
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur("email")}
                    required
                    error={touchedFields.email && !!getEmailValidationMessage()}
                  />
                  {touchedFields.email && !!getEmailValidationMessage() && (
                    <div className="min-h-validation">
                      <ValidationMessage
                        type="error"
                        message={getEmailValidationMessage() || ""}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`${id}-password`}
                    className="text-sm font-medium"
                  >
                    Password<span className="text-red-500">*</span>
                  </Label>
                  <PasswordInput
                    id={`${id}-password`}
                    placeholder="Create a password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur("password")}
                    required
                    error={
                      touchedFields.password && !!getFailingRequirementMessage()
                    }
                  />
                  {touchedFields.password &&
                    password &&
                    getFailingRequirementMessage() && (
                      <div className="min-h-validation">
                        <ValidationMessage
                          type="error"
                          message={getFailingRequirementMessage() || ""}
                        />
                      </div>
                    )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`${id}-confirmPassword`}
                    className="text-sm font-medium"
                  >
                    Confirm Password<span className="text-red-500">*</span>
                  </Label>
                  <PasswordInput
                    id={`${id}-confirmPassword`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    required
                    error={
                      touchedFields.confirmPassword &&
                      (password !== confirmPassword || !confirmPassword)
                    }
                  />
                  {touchedFields.confirmPassword &&
                    (password !== confirmPassword || !confirmPassword) && (
                      <div className="min-h-validation">
                        <ValidationMessage
                          type="error"
                          message="Passwords do not match"
                        />
                      </div>
                    )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id={`${id}-terms`}
                        type="checkbox"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        onBlur={() => {
                          setTouchedFields((prev) => ({
                            ...prev,
                            terms: true,
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    <div className="ml-2">
                      <label
                        htmlFor={`${id}-terms`}
                        className="text-sm text-gray-500"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-purple-600 font-medium hover:text-purple-500"
                          onClick={() => setIsTermsModalOpen(true)}
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-purple-600 font-medium hover:text-purple-500"
                          onClick={() => setIsPrivacyModalOpen(true)}
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                  </div>
                  {touchedFields.terms && !isTermsAccepted && (
                    <div className="min-h-validation">
                      <ValidationMessage
                        type="error"
                        message="You must accept the terms and privacy policy"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-[#FF6B6B] to-[#9933FF] hover:opacity-90 text-white rounded-3xl mt-2 mb-2"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm font-medium text-gray-700 mt-4">
                Already have an account?{" "}
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
