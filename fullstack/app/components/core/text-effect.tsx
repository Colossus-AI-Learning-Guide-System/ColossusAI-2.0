import React from "react";
import { motion } from "framer-motion";

interface TextEffectProps {
  children: string;
  per?: "char" | "word";
  preset?: "fade" | "slide";
  className?: string;
}

export function TextEffect({
  children,
  per = "char",
  preset = "fade",
  className = "",
}: TextEffectProps) {
  const lines = children.split("\n").map((line) => line.trim());
  const items = lines.map((line) =>
    per === "char" ? line.split("") : line.split(" ")
  );

  const animations = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    },
    slide: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {items.map((lineItems, lineIndex) => (
        <motion.div
          key={lineIndex}
          className="flex flex-wrap justify-center whitespace-pre leading-tight"
        >
          {lineItems.map((item, index) => (
            <motion.span
              key={`${lineIndex}-${index}`}
              initial={animations[preset].initial}
              animate={animations[preset].animate}
              transition={{
                ...animations[preset].transition,
                delay: (lineIndex * lineItems.length + index) * 0.05,
              }}
              className="inline-block"
            >
              {item}
              {per === "word" && index < lineItems.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
