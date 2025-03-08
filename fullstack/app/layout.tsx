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
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="noise-overlay" />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}

