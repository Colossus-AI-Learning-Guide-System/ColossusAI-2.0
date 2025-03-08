import React, { ElementType } from "react";
import { motion, useInView } from "framer-motion";

interface TextEffectProps {
  children: string;
  per?: "char" | "word";
  preset?: "fade" | "slide" | "stagger";
  className?: string;
  reverseScroll?: boolean;
  as?: ElementType;
}

export function TextEffect({
  children,
  per = "char",
  preset = "fade",
  className = "",
  reverseScroll = false,
  as: Component = "div",
}: TextEffectProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    margin: "-100px",
    amount: "all",
  });

  const lines = children.split("\n").map((line) => line.trim());
  const items = lines.map((line) =>
    per === "char" ? line.split("") : line.split(" ")
  );

  const animations = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.8 },
    },
    slide: {
      initial: { x: -50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 50, opacity: 0 },
      transition: { duration: 1, ease: "easeOut" },
    },
    stagger: {
      initial: { opacity: 0, y: 30, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -30, scale: 0.9 },
      transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  };

  return (
    <Component
      ref={ref}
      className={`flex flex-col items-center space-y-4 ${className}`}
    >
      {items.map((lineItems, lineIndex) => (
        <motion.div
          key={lineIndex}
          className="flex flex-wrap justify-center whitespace-pre leading-tight"
        >
          {lineItems.map((item, index) => (
            <motion.span
              key={`${lineIndex}-${index}`}
              initial={animations[preset].initial}
              animate={
                isInView
                  ? animations[preset].animate
                  : reverseScroll
                  ? animations[preset].exit
                  : animations[preset].initial
              }
              transition={{
                ...animations[preset].transition,
                delay:
                  (lineIndex * lineItems.length + index) *
                  (isInView ? 0.05 : 0.03),
              }}
              className="inline-block"
            >
              {item}
              {per === "word" && index < lineItems.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </Component>
  );
}
