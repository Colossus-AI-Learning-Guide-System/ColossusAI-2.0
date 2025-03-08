"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Large Bubble 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] opacity-10 blur-3xl"
      />

      {/* Large Bubble 2 */}
      <motion.div
        animate={{
          x: [0, -70, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] opacity-10 blur-3xl"
      />

      {/* Large Bubble 3 */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] opacity-10 blur-3xl"
      />
    </div>
  );
} 