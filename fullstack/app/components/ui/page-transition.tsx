"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GooeyText } from "./gooey-text-morphing";

interface PageTransitionProps {
  isVisible: boolean;
  onTransitionComplete: () => void;
}

export function PageTransition({ isVisible, onTransitionComplete }: PageTransitionProps) {
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      <GooeyText
        texts={["Here..", "The project", "About"]}
        morphTime={0.5}
        cooldownTime={0.5}
        className="font-bold"
        onAnimationComplete={() => {
          setTimeout(() => {
            router.push('/about');
            onTransitionComplete();
          }, 500);
        }}
      />
    </div>
  );
} 