import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/styles.css"
//import PageTransition from "./chatpage/components/PageTransition"
import Toaster from "@/app/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Settings Panel App",
  description: "A Next.js application with a settings panel",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="noise-overlay" />
        {children}
        <Toaster />
      </body>
    </html>
  )
}


