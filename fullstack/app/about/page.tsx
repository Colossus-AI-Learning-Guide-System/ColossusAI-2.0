"use client";

import React from "react";
import { PageLayout } from "../components/layout/page-layout";
import Image from "next/image";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { teamMembers } from "./team-data";
import { HeroParallax } from "../components/blocks/hero-parallax";
import { motion } from "framer-motion";
import { FeatureSteps } from "../components/ui/feature-section";
import { Particles } from "../components/ui/particles";

// Define the images for the parallax effect
const parallaxImages = [
  {
    title: "AI Learning",
    link: "#",
    thumbnail: "/about/ms.png",
  },
  {
    title: "Knowledge Graphs",
    link: "#",
    thumbnail: "/about/Landing.jpg",
  },
  {
    title: "Smart Search",
    link: "#",
    thumbnail: "/about/followus.png",
  },
  {
    title: "Visual Learning",
    link: "#",
    thumbnail: "/about/Marketing1.png",
  },
  {
    title: "AI Assistant",
    link: "#",
    thumbnail: "/about/Landing.jpg",
  },
  {
    title: "Interactive Learning",
    link: "#",
    thumbnail: "/about/Chatpage.png",
  },
  {
    title: "Knowledge Maps",
    link: "#",
    thumbnail: "/about/usecase.png",
  },
  {
    title: "Smart Navigation",
    link: "#",
    thumbnail: "/about/presentation.png",
  },
  {
    title: "Intelligent Search",
    link: "#",
    thumbnail: "/about/ms.png",
  },
  {
    title: "Learning Assistant",
    link: "#",
    thumbnail: "/about/Landing.jpg",
  },
];

const features = [
  {
    step: "Step 1",
    title: "Understand the System and Develop Core Features",
    content:
      " Gain a clear understanding of how the Learning Guide System structures and processes documents.Implement document processing, roadmap generation, and interactive chatbot features.",
    image: "/about/presentation.png",
  },
  {
    step: "Step 2",
    title: "Enhance User Experience",
    content:
      "Improve UI/UX for smooth navigation and clear roadmap presentation.",
    image: "/about/Chatpage.png",
  },
  {
    step: "Step 3",
    title: "Test, Optimize, and Deploy",
    content:
      "Conduct testing to ensure accuracy, speed, and efficiency in generating learning paths. Launch the system and present it with real-world examples to demonstrate its value.",
    image: "/about/Landing_Page_Group3.png",
  },
];

const About = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
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
      <PageLayout>
        {/* Parallax Section */}
        <div className="relative min-h-screen w-full">
          <HeroParallax products={parallaxImages} />
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-8 relative w-full z-20"
        >
          {/* Modify the gradient to be less opaque */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 -z-10"></div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] bg-clip-text text-transparent">
              Team Colossus - SE42
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Meet our talented team of developers and designers who bring
              innovation and creativity to life
            </p>
          </motion.div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center max-w-[1000px] mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -10 }}
                  className={`w-[280px] ${
                    index % 3 === 0
                      ? "md:ml-auto"
                      : index % 3 === 2
                      ? "md:mr-auto"
                      : "mx-auto"
                  }`}
                >
                  <div className="relative bg-black backdrop-blur-lg rounded-[30px] p-6 border-2 border-white/10 transition-all duration-500 hover:border-[#FF4A8D]/50 hover:bg-black">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-[30px] bg-gradient-to-b from-[#FF4A8D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

                    {/* Image Container */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-36 h-36 mx-auto mb-6"
                    >
                      <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-black/40 backdrop-blur-sm">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-[24px]"
                        />
                      </div>
                      {/* Glow effect for image */}
                      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-[#FF4A8D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    </motion.div>

                    {/* Content */}
                    <div className="text-center relative z-10">
                      <motion.h3
                        whileHover={{ scale: 1.05 }}
                        className="text-lg font-bold text-white mb-2 bg-gradient-to-r from-white to-white bg-clip-text group-hover:text-transparent group-hover:from-[#FF9F4A] group-hover:to-[#FF4A8D] transition-all duration-500"
                      >
                        {member.name}
                      </motion.h3>
                      <p className="text-gray-300 mb-6 text-sm opacity-90 line-clamp-2">
                        {member.role}
                      </p>

                      {/* LinkedIn Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white rounded-[20px] font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#FF4A8D]/25 text-sm"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>Connect</span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Add FeatureSteps component here */}
        <div className="bg-black">
          <FeatureSteps
            features={features}
            title="Your Journey Starts Here"
            autoPlayInterval={4000}
          />
        </div>
      </PageLayout>
    </div>
  );
};

export default About;
