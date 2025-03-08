"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleTermsModal = () => setIsTermsModalOpen((prev) => !prev);

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
            <h2 className="text-xl font-bold mb-4 text-white">
              Terms & Conditions
            </h2>
            <h3 className="font-semibold mt-4 text-white">
              1. Acceptance of Terms
            </h3>
            <p className="text-gray-300">
              By accessing and using Colossus.AI, you agree to be bound by these
              Terms and Conditions.
            </p>
            <h3 className="font-semibold mt-4 text-white">2. Use of Service</h3>
            <p className="text-gray-300">
              You agree to use our service only for lawful purposes and in
              accordance with these Terms.
            </p>
            <h3 className="font-semibold mt-4 text-white">3. User Accounts</h3>
            <p className="text-gray-300">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities under your account.
            </p>
            <h3 className="font-semibold mt-4 text-white">
              4. Intellectual Property
            </h3>
            <p className="text-gray-300">
              All content, features, and functionality of Colossus.AI are owned
              by us and are protected by international copyright, trademark, and
              other intellectual property laws.
            </p>
            <h3 className="font-semibold mt-4 text-white">
              5. Privacy
            </h3>
            <p className="text-gray-300">
              Your use of Colossus-AI is also governed by our Privacy Policy. Please review our Privacy Policy.
            </p>
            
            <h3 className="font-semibold mt-4 text-white">
              6. Modifications
            </h3>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
            </p>
            
            <p className="text-gray-300 mt-4 italic">
              Last updated: 2/24/2025
            </p>
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
            <h2 className="text-xl font-bold mb-4 text-white">
              Privacy Policy
            </h2>
            <p className="text-gray-300">
              Please read our privacy policy carefully.
            </p>
            <h3 className="font-semibold mt-4 text-white">
              1. Information We Collect
            </h3>
            <p className="text-gray-300">
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Create an account</li>
              <li>Use our services</li>
              <li>Contact us for support</li>
              <li>Subscribe to our communications</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">
              2. How We Use Your Information
            </h3>
            <p className="text-gray-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">
              3. Information Sharing
            </h3>
            <p className="text-gray-300">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Service providers who assist in our operations</li>
              <li>Professional advisers</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">
              4. Data Security
            </h3>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
            <h3 className="font-semibold mt-4 text-white">
              5. Your Rights
            </h3>
            <p className="text-gray-300">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <h3 className="font-semibold mt-4 text-white">
              6. Contact Us
            </h3>
            <p className="text-gray-300">
              If you have questions about this Privacy Policy, please contact us at:<br />
              Email: colossus.ai.lk@gmail.com
            </p>
            <p className="text-gray-300 mt-4 italic">
              Last updated: 2/24/2025
            </p>
            <button
              onClick={toggleModal}
              className="mt-4 bg-[#FF4A8D] text-white py-2 px-4 rounded hover:bg-[#FF6B9D] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
                Transforming learning experiences through intelligent
                visualization.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["Features", "Contactus", "About"].map((item) => (
                  <li key={item}>
                    <Link
                      href={
                        item === "Features"
                          ? "/#features"
                          : `/${item.toLowerCase().replace(/ /g, "-")}`
                      }
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
                <li>
                  <Link
                    href="/contactus#contact-form"
                    className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                  >
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
                  <Link
                    href="/#faq"
                    className="text-gray-400 hover:text-[#FF4A8D] transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <Link
                  href="https://www.facebook.com/colossusai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.youtube.com/@ColossusAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Youtube className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/colossusailk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/colossusai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="https://x.com/colossusailk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="https://discord.gg/JB473YPGUM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link
                  href="https://github.com/Colossus-AI-Learning-Guide-System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#FF4A8D]"
                >
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex justify-center items-center">
            <p className="text-gray-400 text-base">
              © {currentYear} Colossus.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
