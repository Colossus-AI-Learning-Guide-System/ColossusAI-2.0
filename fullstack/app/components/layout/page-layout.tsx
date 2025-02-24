"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AnimatedBackground } from "../ui/animated-background";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black">
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-screen bg-black pt-16">{children}</main>
      <Footer />
    </div>
  );
}
