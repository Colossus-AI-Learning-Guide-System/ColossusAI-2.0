"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { TestimonialsSection } from "./components/block/testimonials-with-marquee";
import { HeroScrollDemo } from "./components/block/code-demo";
import Link from "next/link";
import { Navbar } from "./components/layout/navbar";
import {
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Github,
} from "lucide-react";
import { AnimatedBackground } from "./components/ui/animated-background";
import { LampContainer } from "./components/ui/lamp";
import { TextEffect } from './components/core/text-effect';

// ... existing code ...

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section with Lamp Effect */}
      <main className="min-h-screen hero-gradient">
        <div>
          <LampContainer>
            <div className="flex flex-col items-center justify-center mt-[500px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                className="mb-12"
              >
                <Image
                  src="/logo.png"
                  alt="Colossus.AI Logo"
                  width={250}
                  height={250}
                  className="rounded-full"
                />
              </motion.div>
              <h1 className="text-6xl md:text-7xl font-bold mb-10">
                <span className="gradient-text">
                  <TextEffect per="char" preset="fade">
                    Colossus.AI
                  </TextEffect>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl mx-auto text-center">
                Your AI Powered roadmap visualization tool for seamless learning
                and documentation navigation
              </p>
// ... existing code ...
</>
  );
}