import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Toaster from "@/app/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Settings Panel App",
  description: "A Next.js application with a settings panel",
}
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/globals.css"
import PageTransition from "./chatpage/components/PageTransition"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      <body className={inter.className}>
        <div className="noise-overlay" />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
  )
}


