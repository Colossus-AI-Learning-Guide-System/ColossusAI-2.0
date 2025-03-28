"use client";

import { resendOTP, verifyOTP } from "@/lib/supabase/auth";
import { useEffect, useRef, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "./ui/input-otp";
import { Button } from "./ui/signup/button";

interface OTPVerificationProps {
  email: string;
  onVerificationComplete: () => void;
}

export default function OTPVerification({ email, onVerificationComplete }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [status, setStatus] = useState<{ 
    type: 'success' | 'error' | 'warning'; 
    message: string;
    errorType?: 'incorrect' | 'expired' | 'other'; 
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const otpInputRef = useRef<HTMLDivElement>(null);

  // Auto-focus the OTP input when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      // Find the input element within our component and focus it
      const inputElement = document.querySelector('.otp-input-container input');
      if (inputElement) {
        (inputElement as HTMLInputElement).focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setStatus({
        type: 'error',
        message: "Please enter the complete 6-digit verification code"
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await verifyOTP(email, otp);
      
      if (error) {
        // Default to "Invalid code" for most OTP errors
        let errorMessage = "Invalid code";
        let errorType: 'incorrect' | 'expired' | 'other' = 'incorrect'; // Default error classification
        
        if (typeof error === "object" && error !== null) {
          // Check for our custom error classification first
          if ('errorType' in error) {
            const errType = String(error.errorType);
            
            // Only use 'expired' error type when the token has actually expired
            if (errType === 'expired_code') {
              errorType = 'expired';
              errorMessage = "Invalid code";
            } else {
              // All other error types show as invalid code
              errorType = 'incorrect';
              errorMessage = "Invalid code";
            }
          }
          // Fall back to message parsing if no errorType is present
          else if ("message" in error && typeof error.message === "string") {
            const errorStr = error.message.toLowerCase();
            
            // Only classify as expired if explicitly mentioned
            if (errorStr.includes("expired")) {
              errorType = 'expired';
              errorMessage = "Verification code has expired. Please request a new code.";
            } else {
              // All other errors (including "invalid") are treated as incorrect code
              errorType = 'incorrect';
              errorMessage = "Invalid code";
            }
          }
        }
        
        // Set error status directly 
        setStatus({
          type: 'error',
          message: errorMessage,
          errorType: errorType
        });
        setLoading(false);
        return;
      }

      setStatus({
        type: 'success',
        message: "Email verified successfully!"
      });
      
      // Notify parent component that verification is complete
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
      
    } catch (err) {
      console.error("OTP verification error:", err);
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setStatus(null);

    try {
      const { error } = await resendOTP(email);
      
      if (error) {
        // Handle specific error types from Supabase
        let errorMessage = "Failed to send verification code";
        let errorType: 'incorrect' | 'expired' | 'other' = 'other';
        
        if (typeof error === "object" && error !== null) {
          if ("message" in error && typeof error.message === "string") {
            // Handle specific error cases
            if (error.message.includes("rate")) {
              errorMessage = "Too many requests. Please try again later.";
            } else if (error.message.includes("already verified")) {
              errorMessage = "This email is already verified.";
            } else {
              errorMessage = error.message;
            }
          }
        }
        
        // Set error status directly
        setStatus({
          type: 'error',
          message: errorMessage,
          errorType: errorType
        });
        setResendLoading(false);
        return;
      }

      // Start cooldown timer
      setTimeLeft(60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setStatus({
        type: 'success',
        message: "A new verification code has been sent to your email"
      });
    } catch (err) {
      console.error("Resend OTP error:", err);
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        errorType: 'other'
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-gray-500">
          We sent a 6-digit verification code to <span className="font-medium text-gray-300">{email}</span>
        </p>
      </div>

      <style jsx global>{`
        /* Custom OTP input styles for improved visibility */
        .animate-caret-blink {
          animation: caretBlink 1s infinite;
          width: 2px !important;
          height: 20px !important;
          background-color: #9333EA !important; /* Purple cursor */
        }
        
        @keyframes caretBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Enhance active slot styling */
        [data-slot-active="true"] {
          box-shadow: 0 0 0 2px #9333EA, 0 0 10px rgba(147, 51, 234, 0.5);
          border-color: #9333EA !important;
        }
        
        /* Add glow to the entire input container */
        .otp-input-container {
          padding: 1.5rem;
          border-radius: 0.75rem;
          background: rgba(15, 23, 42, 0.3);
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.2);
          margin-bottom: 0.5rem;
        }
        
        /* Simple error message style */
        .otp-error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding-left: 0.5rem;
        }
        
        .otp-error-message svg {
          flex-shrink: 0;
          height: 8px;
          width: 8px;
        }
      `}</style>

      <div className="flex justify-center otp-input-container">
        <InputOTP 
          maxLength={6} 
          value={otp}
          onChange={setOtp}
          className="gap-3"
        >
          <InputOTPGroup>
            <InputOTPSlot 
              index={0} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
            <InputOTPSlot 
              index={1} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
            <InputOTPSlot 
              index={2} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
            <InputOTPSlot 
              index={3} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
            <InputOTPSlot 
              index={4} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
            <InputOTPSlot 
              index={5} 
              className="bg-blue-950/40 border-purple-500/70 text-white h-12 w-12 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200" 
            />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      {status && status.type === 'error' && (
        <div className="otp-error-message">
          <svg viewBox="0 0 24 24" width="8" height="8">
            <circle cx="12" cy="12" r="12" fill="currentColor" />
          </svg>
          <span>{status.message}</span>
        </div>
      )}

      {status?.type === 'success' && (
        <div className="text-center text-sm text-green-500 mb-3">
          <svg className="inline-block mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          {status.message}
        </div>
      )}

      <div className="text-center text-sm text-gray-400 bg-blue-950/20 py-2 px-3 rounded-lg mx-auto max-w-md border border-blue-900/50">
        <p className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Click on any box to edit a specific digit if you made a mistake</span>
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          className="w-full py-2 px-3 h-11 rounded-3xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white"
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            {timeLeft > 0 ? (
              <span className="text-red-500">Resend in {timeLeft}s</span>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading || timeLeft > 0}
                className="text-red-500 hover:text-red-400 disabled:text-gray-600 disabled:hover:text-gray-600"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
} 