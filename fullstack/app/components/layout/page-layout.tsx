"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AnimatedBackground } from "../ui/animated-background";
import { ChatBot } from "../ui/chatbot";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black">
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-screen bg-black pt-16">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
}
