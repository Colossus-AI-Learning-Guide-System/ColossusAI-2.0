"use client";

import { PageLayout } from "../components/layout/page-layout";
import Link from 'next/link';
import { socialLinks } from './social-data';

const ContactUs = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-white">Connect With Us</h1>
          
          {/* Social Media Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {socialLinks.map((social) => (
              <Link 
                href={social.url}
                key={social.name}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.bgColor} backdrop-blur-lg rounded-lg p-6 text-white transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center space-y-4 border-2 border-white/20`}
              >
                {social.icon}
                <span className="text-lg font-semibold">{social.name}</span>
              </Link>
            ))}
          </div>

          {/* Discord Widget */}
          <div className="flex justify-center">
            <div className="bg-[#5865F2] backdrop-blur-lg rounded-lg p-6 text-white w-full max-w-md border-2 border-white/20">
              <div className="w-full h-full flex flex-col items-center">
                <span className="text-lg font-semibold mb-4">Join Our Discord</span>
                <iframe 
                  src="https://discord.com/widget?id=1296419198632722543&theme=dark" 
                  width="100%" 
                  height="400" 
                  allowtransparency="true"
                  frameBorder="0" 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ContactUs;