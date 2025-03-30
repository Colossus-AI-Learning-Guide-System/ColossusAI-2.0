"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface MobileWarningProps {
  className?: string;
  isAuthenticated?: boolean;
}

export function MobileWarning({
  className,
  isAuthenticated = true,
}: MobileWarningProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if the screen width is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Check if the user has dismissed the warning before
    const hasSeenWarning = localStorage.getItem("mobile-warning-dismissed");
    if (hasSeenWarning === "true") {
      setIsVisible(false);
    } else {
      // Only animate entry if we're showing the warning
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Dismiss the warning and remember user preference
  const dismissWarning = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("mobile-warning-dismissed", "true");
    }, 300);
  };

  // Only show on mobile, if not dismissed, and if user is authenticated (or authentication check is bypassed)
  if (!isMobile || !isVisible || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        } ${className}`}
        style={{ maxWidth: "400px" }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            Mobile Device Detected
          </h3>
          <button
            onClick={dismissWarning}
            className="text-white rounded-full p-1 hover:bg-blue-500/50 transition focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <p className="text-sm md:text-base dark:text-gray-200 mb-4">
            For the best experience with our document analysis features, we
            recommend using a desktop or laptop computer.
          </p>
          <button
            onClick={dismissWarning}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
