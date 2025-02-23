"use client";

import React from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
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
  XIcon,
} from "lucide-react";
import { TextEffect } from "./components/core/text-effect";
import { Particles } from "./components/ui/particles";
import { FeaturePopup } from "./components/ui/feature-popup";
import { TestimonialsDemo } from "./components/ui/testimonials.demo";
import { Faq3Demo } from "./components/blocks/faq3";

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

function Footer({ 
  isModalOpen, 
  toggleModal, 
  isTermsModalOpen,
  toggleTermsModal,
  currentYear 
}: { 
  isModalOpen: boolean; 
  toggleModal: () => void; 
  isTermsModalOpen: boolean;
  toggleTermsModal: () => void;
  currentYear: number 
}) {
  return (
    <footer className="relative z-10 bg-black/50 backdrop-blur-lg border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Colossus.AI Logo" width={32} height={32} className="rounded-full" />
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
              <li>
                <Link href="/help-center" className="text-gray-400 hover:text-[#FF4A8D] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <button
                  onClick={toggleTermsModal}
                  className="text-gray-400 hover:text-[#FF4A8D] cursor-pointer bg-transparent border-none p-0 text-left w-full transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={toggleModal}
                  className="text-gray-400 hover:text-[#FF4A8D] cursor-pointer bg-transparent border-none p-0 text-left w-full transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-[#FF4A8D] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Stay updated with our latest features and releases.</p>
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
          <p className="text-gray-400 text-base">© {currentYear} Colossus.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const toggleTermsModal = () => {
    setTermsModalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isModalOpen || isTermsModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, isTermsModalOpen]);

  return (
    <>
      {/* Terms of Service Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-black p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            <button
              onClick={toggleTermsModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-white">Terms & Conditions</h2>
            
            <h3 className="font-semibold mt-4 text-white">1. Acceptance of Terms</h3>
            <p className="text-gray-300">By accessing and using Colossus.AI, you agree to be bound by these Terms and Conditions.</p>

            <h3 className="font-semibold mt-4 text-white">2. Use of Service</h3>
            <p className="text-gray-300">You agree to use our service only for lawful purposes and in accordance with these Terms.</p>

            <h3 className="font-semibold mt-4 text-white">3. User Accounts</h3>
            <p className="text-gray-300">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

            <h3 className="font-semibold mt-4 text-white">4. Intellectual Property</h3>
            <p className="text-gray-300">All content, features, and functionality of Colossus.AI are owned by us and are protected by international copyright, trademark, and other intellectual property laws.</p>

            <h3 className="font-semibold mt-4 text-white">5. Privacy</h3>
            <p className="text-gray-300">Your use of Colossus.AI is also governed by our Privacy Policy. Please review our Privacy Policy.</p>

            <h3 className="font-semibold mt-4 text-white">6. Modifications</h3>
            <p className="text-gray-300">We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>

            <button
              onClick={toggleTermsModal}
              className="mt-4 bg-[#FF4A8D] text-white py-2 px-4 rounded hover:bg-[#FF6B9D] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-black p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-white">Privacy Policy</h2>
            <p className="text-gray-300">Please read our privacy policy carefully.</p>
            <h3 className="font-semibold mt-4 text-white">1. Information We Collect</h3>
            <p className="text-gray-300">We collect information you provide directly to us when you:</p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Create an account</li>
              <li>Use our services</li>
              <li>Contact us for support</li>
              <li>Subscribe to our communications</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">2. How We Use Your Information</h3>
            <p className="text-gray-300">We use the information we collect to:</p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">3. Information Sharing</h3>
            <p className="text-gray-300">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Service providers who assist in our operations</li>
              <li>Professional advisers</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">4. Data Security</h3>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the Internet is 100% secure.
            </p>
            <h3 className="font-semibold mt-4 text-white">5. Your Rights</h3>
            <p className="text-gray-300">You have the right to:</p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">6. Contact Us</h3>
            <p className="text-gray-300">If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="text-gray-300">Email: support@colossus.ai</p>
            <button
              onClick={toggleModal}
              className="mt-4 bg-[#FF4A8D] text-white py-2 px-4 rounded hover:bg-[#FF6B9D] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Particles
        className="fixed inset-0 -z-10 pointer-events-none"
        quantity={300}
        staticity={30}
        ease={50}
        color="#FF4A8D"
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

      {/* Hero Section */}
      <main className={`min-h-screen bg-transparent ${isModalOpen || isTermsModalOpen ? 'pointer-events-none' : ''}`}>
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
        <div className="container mx-auto px-4 py-24 relative z-10">
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
        <div className="youtube-video flex flex-col items-center py-16">
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
        <Faq3Demo />
      </main>
      
      <Footer 
        isModalOpen={isModalOpen}
        toggleModal={toggleModal}
        isTermsModalOpen={isTermsModalOpen}
        toggleTermsModal={toggleTermsModal}
        currentYear={currentYear}
      />
    </>
  );
}
