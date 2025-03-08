"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with continuous rotation */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            >
              <Image
                src="/logo.png"
                alt="Colossus.AI Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </motion.div>
            <span className="font-bold text-xl">Colossus.AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Feedback", "Rateus", "Contactus", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ & /g, '-')}`}
                className="relative text-gray-300 hover:text-white transition-colors group"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <div className="inline-flex rounded-full overflow-hidden border border-white/30">
              <Link href="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white pr-6 pl-8 py-2 font-semibold hover:text-[#FF4A8D] transition-colors rounded-l-full border-r border-white/0"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white px-8 py-2 rounded-full font-semibold"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 