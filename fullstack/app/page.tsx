"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { TestimonialsSection } from "@/app/components/block/testimonials-with-marquee";
import { HeroScrollDemo } from "@/app/components/block/code-demo";
import Link from "next/link";
import {
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Github
} from "lucide-react";
import { AnimatedBackground } from "@/app/components/ui/animated-background";

const testimonials = [
  {
    author: {
      name: "Sudesh Senevirathne",
      handle: "@profanderson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    text: "The knowledge graph visualization has completely transformed how I teach complex subjects. My students grasp concepts much faster now.",
    href: "https://twitter.com/profanderson",
  },
  {
    author: {
      name: "Dr. Emily Zhang",
      handle: "@emilyzhang_ai",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    text: "As a researcher, Colossus.AI has been invaluable. It turns our complex documentation into clear, navigable roadmaps.",
    href: "https://twitter.com/emilyzhang_ai",
  },
  {
    author: {
      name: "Mark Davidson",
      handle: "@markdavidson",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    text: "The intuitive interface and powerful visualization tools have revolutionized how our team handles documentation. Simply brilliant!",
  },
  {
    author: {
      name: "Dr. Rachel Martinez",
      handle: "@drmartinez",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    text: "Colossus.AI has made it possible to create comprehensive learning paths for our medical residents. A game-changer in medical education.",
  },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with continuous rotation */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: 360 
              }}
              transition={{ 
                duration: 4,
                ease: "linear",
                repeat: Infinity
              }}
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
            {[
              "Feedback",
              "Rateus",
              "Contactus",
              "About"
            ].map((item) => (
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

function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Colossus.AI Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-bold text-xl">Colossus.AI</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Transforming learning experiences through intelligent visualization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Features", "Feedback", "Rateus", "Contactus", "About"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {["Help Center", "Terms of Service", "Privacy Policy", "FAQ"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Stay updated with our latest features and releases.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="https://www.facebook.com/colossusai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.youtube.com/@ColossusAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/colossusailk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/colossusai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="https://x.com/colossusailk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="https://discord.gg/JB473YPGUM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link
                  href="https://github.com/Colossus-AI-Learning-Guide-System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex justify-center items-center">
          <p className="text-gray-400 text-base">
            © {new Date().getFullYear()} Colossus.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
import { SettingsButton } from "@/app/components/ui/settings-button"

const page = () => {
  return (
    <>
    </>
  );
}

