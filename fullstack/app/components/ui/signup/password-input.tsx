import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "flex h-9 w-full rounded-3xl border-2 border-[#9933FF] bg-background px-4 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:border-[#9933FF] focus:ring-1 focus:ring-[#9933FF] disabled:cursor-not-allowed disabled:opacity-50 pr-10",
            error && "error border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          data-invalid={error ? "true" : undefined}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72 1.52a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M1 12s4-8 11-8c7 0 11 8 11 8"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8c7 0 11 8 11 8-4 8-11 8-11 8-7 0-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };