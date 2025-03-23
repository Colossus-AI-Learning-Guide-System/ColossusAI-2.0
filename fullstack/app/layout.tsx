import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Toaster from "@/app/components/ui/toaster";
import PageTransition from "./chatpage/components/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Colossus AI",
  description: "Colossus AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="noise-overlay" />
        <PageTransition>
          <main className="flex min-h-screen flex-col items-center justify-center">
            {children}
          </main>
        </PageTransition>
        <Toaster />
      </body>
    </html>
  );
} 