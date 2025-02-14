"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";

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

export default function Home() {
  return (
    <main className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Colossus.AI Logo"
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="gradient-text">Colossus.AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Your intelligent roadmap visualization tool for seamless learning
            and documentation navigation
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 text-white px-8 py-3 rounded-full font-semibold backdrop-blur-sm"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
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

      {/* Testimonials Section */}
      <TestimonialsSection
        title="Trusted by educators and researchers worldwide"
        description="Join thousands of professionals who are already transforming their learning experience with Colossus.AI"
        testimonials={testimonials}
      />
    </main>
  );
}
