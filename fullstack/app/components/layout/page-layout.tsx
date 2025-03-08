"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AnimatedBackground } from "../ui/animated-background";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-screen hero-gradient pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
} 