"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";

export function AspectRatioWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isNear16by9 = Math.abs(aspectRatio - 16/9) > 0.2; // Tolerance of 0.2
      setShowWarning(isNear16by9 && !dismissed);
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);

    return () => {
      window.removeEventListener('resize', checkAspectRatio);
    };
  }, [dismissed]);

  if (!showWarning) return null;

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <p className="text-white text-sm">
                This website is not optimized for mobile devices
              </p>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/60 hover:text-white ml-4"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 