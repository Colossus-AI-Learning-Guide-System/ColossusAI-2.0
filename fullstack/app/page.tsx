"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { TestimonialsSection } from "./components/block/testimonials-with-marquee";
import { HeroScrollDemo } from "./components/block/code-demo";
import Link from "next/link";
import { Navbar } from "./components/layout/navbar";
import {
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Github,
} from "lucide-react";
import { TextEffect } from "./components/core/text-effect";
import { Particles } from "./components/ui/particles";

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

function Footer() {
  return (
    <footer className="relative z-10 bg-black/50 backdrop-blur-lg border-t border-white/10 py-12">
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
              Transforming learning experiences through intelligent
              visualization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Features", "Feedback", "Rateus", "Contactus", "About"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                      className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {["Help Center", "Terms of Service", "Privacy Policy", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                      className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
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

export default function Home() {
  return (
    <>
      <Particles
        className="fixed inset-0 -z-10 pointer-events-none"
        quantity={300}
        staticity={30}
        ease={50}
        color="#FF4A8D"
      />
      <Navbar />

      {/* Hero Section */}
      <main className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className="mb-8"
            >
              <Image
                src="/logo.png"
                alt="Colossus.AI Logo"
                width={200}
                height={200}
                className="rounded-full"
              />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-16 text-center">
              <TextEffect per="word" preset="fade" className="text-white">
                {`AI-Powered Learning,\nSmarter Knowledge Navigation`}
              </TextEffect>
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all mb-8"
            >
              Try Colossus.AI →
            </motion.button>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF]"
          >
            Your Personalized AI Roadmaps
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <DocumentTextIcon className="w-12 h-12 text-[#ff6b6b] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Smart Document Processing
              </h3>
              <p className="text-gray-400">
                Upload and process your documentation materials with ease,
                creating intuitive knowledge graphs.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <ChartBarIcon className="w-12 h-12 text-[#ff8e53] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Visual Knowledge Graphs
              </h3>
              <p className="text-gray-400">
                Transform complex information into clear, interactive visual
                roadmaps.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <ShareIcon className="w-12 h-12 text-[#ff6b6b] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-400">
                Share your generated knowledge graphs with others to enhance
                collaboration.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Demo Section */}
        <div className="relative z-10">
          <HeroScrollDemo />
        </div>

        {/* Testimonials Section */}
        <div className="relative z-10">
          <TestimonialsSection
            title="Trusted by educators and researchers worldwide"
            description="Join thousands of professionals who are already transforming their learning experience with Colossus.AI"
            testimonials={testimonials}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
