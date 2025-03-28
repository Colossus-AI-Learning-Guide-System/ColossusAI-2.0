import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Toaster from "@/app/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Force dynamic rendering for all pages
export const dynamic = "force-dynamic";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="noise-overlay" />
          <main className="min-h-screen w-full overflow-x-visible p-0 m-0">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
