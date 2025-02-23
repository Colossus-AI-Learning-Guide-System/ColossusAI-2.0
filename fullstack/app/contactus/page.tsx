"use client";

import Link from 'next/link';
import { PageLayout } from "../components/layout/page-layout";
import { socialLinks } from './social-data';

const ContactUs = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-white">Connect With Us</h1>
          
          {/* Social Media Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {socialLinks.map((social) => (
              <Link 
                href={social.url}
                key={social.name}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.bgColor === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-700'} backdrop-blur-lg rounded-lg p-6 text-white transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:animate-pulse flex flex-col items-center justify-center space-y-4 border-2 border-white/20`}
              >
                {social.icon}
                <span className="text-lg font-semibold">{social.name}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export default ContactUs;