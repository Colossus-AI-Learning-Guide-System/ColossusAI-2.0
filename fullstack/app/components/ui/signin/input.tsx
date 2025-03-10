import { cn } from "@/lib/utils";
import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-3xl border-2 border-[#9933FF] bg-background px-4 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:border-[#9933FF] focus:ring-1 focus:ring-[#9933FF] disabled:cursor-not-allowed disabled:opacity-50",
          error && "error border-red-500 focus:border-red-500 focus:ring-red-500/20",
          type === "search" &&
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          type === "file" &&
            "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
          className,
        )}
        aria-invalid={error ? "true" : undefined}
        data-invalid={error ? "true" : undefined}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

