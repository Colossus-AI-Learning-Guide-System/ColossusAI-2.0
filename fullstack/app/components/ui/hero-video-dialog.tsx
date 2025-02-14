"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  className?: string;
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];

  return (
    <div className={cn("relative w-full", className)}>
      <div className="aspect-[16/9] w-full">
        {!isVideoOpen ? (
          <div
            className="relative cursor-pointer group w-full h-full"
            onClick={() => setIsVideoOpen(true)}
          >
            <img
              src={thumbnailSrc}
              alt={thumbnailAlt}
              width={1920}
              height={1080}
              className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-[0.8] ease-out rounded-xl shadow-2xl border-2 border-white/10"
            />
            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-100 scale-[0.9] transition-all duration-200 ease-out rounded-2xl">
              <div className="bg-primary/10 flex items-center justify-center rounded-full backdrop-blur-md size-32">
                <div
                  className={`flex items-center justify-center bg-gradient-to-b from-primary/30 to-primary shadow-md rounded-full size-24 transition-all ease-out duration-200 relative group-hover:scale-[1.2] scale-100`}
                >
                  <Play
                    className="size-10 text-white fill-white group-hover:scale-105 scale-100 transition-transform duration-200 ease-out"
                    style={{
                      filter:
                        "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            {...selectedAnimation}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full h-full"
          >
            <div className="absolute -top-6 right-0 z-10">
              <button
                onClick={() => setIsVideoOpen(false)}
                className="bg-neutral-900/50 ring-1 backdrop-blur-md rounded-full p-3 text-white hover:bg-neutral-900/70 transition-colors"
              >
                <XIcon className="size-6" />
              </button>
            </div>
            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <iframe
                src={videoSrc}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
