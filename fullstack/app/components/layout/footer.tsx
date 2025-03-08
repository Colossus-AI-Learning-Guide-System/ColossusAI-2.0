"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, Instagram, Linkedin, Twitter, MessageCircle, Github } from "lucide-react";

export function Footer() {
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
            <div className="flex gap-4">
              <Link href="https://facebook.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://youtube.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Youtube className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://discord.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link href="https://github.com" className="text-gray-400 hover:text-[#FF4A8D]">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 