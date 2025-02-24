"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeroScrollDemo } from "./components/block/code-demo";
import { Navbar } from "./components/layout/navbar";

import { TextEffect } from "./components/core/text-effect";
import { Particles } from "./components/ui/particles";
import { FeaturePopup } from "./components/ui/feature-popup";
import { TestimonialsDemo } from "./components/ui/testimonials.demo";
import { Faq3Demo } from "./components/blocks/faq3";
import { Footer } from "./components/layout/footer";

// Feature data structure
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  shortDescription: string;
}

const features: Feature[] = [
  {
    title: "AI-Powered Knowledge Graphs",
    description:
      "Process documents and generate structured, interactive visual roadmaps, making learning more engaging and intuitive.\n\nKey Features:\n• Automated graph generation\n• Interactive visualization\n• Semantic relationship mapping\n• Real-time updates",
    icon: (
      <div className="relative w-16 h-16">
        <Image
          src="/icons/Knowledge Graph.png"
          alt="Knowledge Graph Icon"
          fill
          className="object-contain invert brightness-0"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>
    ),
    shortDescription: "Visual roadmaps from documents for easier learning",
  },
  {
    title: "Intelligent Search & Query",
    description:
      "Enter natural language queries and retrieve relevant insights from uploaded documents with ease.\n\nKey Features:\n• Natural language processing\n• Semantic search\n• Context-aware results\n• Quick filtering options",
    icon: (
      <div className="relative w-16 h-16">
        <Image
          src="/icons/search.png"
          alt="Search Icon"
          fill
          className="object-contain invert brightness-0"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>
    ),
    shortDescription:
      "Enter queries in natural language to find relevant insights quickly.",
  },
  {
    title: "Smart Document Management",
    description:
      "Upload, organize, and search documents effortlessly. Create and manage custom directories for efficient content structuring.\n\nKey Features:\n• Drag-and-drop upload\n• Automatic categorization\n• Version control\n• Advanced search capabilities",
    icon: (
      <div className="relative w-16 h-16">
        <Image
          src="/icons/Document.png"
          alt="Document Management Icon"
          fill
          className="object-contain invert brightness-0"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>
    ),
    shortDescription:
      "Upload and organize documents with ease for efficient access.",
  },
  {
    title: "AI-Generated Summaries",
    description:
      "Save time with concise, AI-powered document summaries for quick insights.\n\nKey Features:\n• Automatic summarization\n• Key points extraction\n• Customizable length\n• Multi-document synthesis",
    icon: (
      <div className="relative w-16 h-16">
        <Image
          src="/icons/summarize.png"
          alt="Summaries Icon"
          fill
          className="object-contain invert brightness-0"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>
    ),
    shortDescription:
      "Get quick, AI-powered summaries to understand documents faster.",
  },
  {
    title: "Collaboration & Sharing",
    description:
      "Easily share generated knowledge graphs with peers. Enhance group learning and team collaboration.\n\nKey Features:\n• Real-time collaboration\n• Access control\n• Comment system\n• Export and sharing options",
    icon: (
      <div className="relative w-16 h-16">
        <Image
          src="/icons/share.png"
          alt="Share Icon"
          fill
          className="object-contain invert brightness-0"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>
    ),
    shortDescription:
      "Share knowledge graphs with others to enhance group learning.",
  },
];

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  return (
    <div className="bg-black min-h-screen w-full relative overflow-hidden">
      <Particles
        className="absolute inset-0 pointer-events-none z-10"
        quantity={300}
        staticity={20}
        ease={70}
        color="#FF4A8D"
        refresh={false}
        size={1.5}
        vx={0.2}
        vy={0.2}
      />
      <Navbar />

      {/* Feature Popup */}
      <FeaturePopup
        isOpen={selectedFeature !== null}
        onClose={() => setSelectedFeature(null)}
        title={selectedFeature?.title || ""}
        description={selectedFeature?.description || ""}
        icon={selectedFeature?.icon}
      />

      {/* Main content */}
      <main className="relative">
        {/* Hero Section */}
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
        <div className="container mx-auto px-4 py-24" id="features">
          <div className="text-4xl md:text-5xl font-bold text-center mb-16">
            <TextEffect
              className="inline-flex bg-clip-text text-transparent bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF]"
              per="char"
              preset="stagger"
              reverseScroll={true}
            >
              Innovative Tools for Smarter Learning
            </TextEffect>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {features.slice(0, 3).map((feature) => (
              <motion.div
                key={feature.title}
                className="bg-[#2d2d2d] backdrop-blur-lg rounded-xl p-8 hover:bg-[#333] transition-all duration-300 border border-white/10 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-black/20 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  opacity: selectedFeature?.title === feature.title ? 0 : 1,
                  scale: selectedFeature?.title === feature.title ? 0.8 : 1,
                }}
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#e1e1e1]">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.shortDescription}
                </p>
              </motion.div>
            ))}

            <div className="md:col-span-3 flex justify-center gap-8">
              {features.slice(3).map((feature) => (
                <motion.div
                  key={feature.title}
                  className="bg-[#2d2d2d] backdrop-blur-lg rounded-xl p-8 hover:bg-[#333] transition-all duration-300 border border-white/10 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-black/20 group w-full md:w-[calc(33.33%-1rem)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    opacity: selectedFeature?.title === feature.title ? 0 : 1,
                    scale: selectedFeature?.title === feature.title ? 0.8 : 1,
                  }}
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-[#e1e1e1]">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.shortDescription}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* New YouTube Video Section */}
        <div
          className="youtube-video flex flex-col items-center py-16"
          id="help"
        >
          <h2 className="text-4xl font-bold mb-4">Watch Our Video</h2>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <iframe
              width="854"
              height="480"
              src="https://www.youtube.com/embed/QggJzZdIYPI"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Scroll Demo Section */}
        <div className="relative z-10">
          <HeroScrollDemo />
        </div>

        {/* Add the TestimonialsDemo component here */}
        <TestimonialsDemo />
        <div id="faq">
          <Faq3Demo />
        </div>
      </main>

      <Footer />
    </div>
  );
}
