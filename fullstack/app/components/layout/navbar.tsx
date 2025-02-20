"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 backdrop-blur-sm bg-black/10">
          {/* Logo with continuous rotation */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            >
              <Image
                src="/logo.png"
                alt="Colossus.AI Logo"
                width={65}
                height={65}
                className="rounded-full"
              />
            </motion.div>
            <span className="font-bold text-2xl text-white">ColossusAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Feedback", "Rateus", "Contactus", "About"].map(
              (item) => (
                <Link
                  key={item}
                  href={
                    item === "Home"
                      ? "/"
                      : `/${item.toLowerCase().replace(/ & /g, "-")}`
                  }
                  className="relative text-white hover:text-white/80 transition-colors group text-lg"
                >
                  {item}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
