"use client";

import { PageLayout } from "../components/layout/page-layout";
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { teamMembers } from './team-data';
import { HeroParallax } from '../components/blocks/hero-parallax';

// Define the images for the parallax effect
const parallaxImages = [
  {
    title: "AI Learning",
    link: "#",
    thumbnail: "/about/ms.png"
  },
  {
    title: "Knowledge Graphs",
    link: "#",
    thumbnail: "/about/Landing.jpg"
  },
  {
    title: "Smart Search",
    link: "#",
    thumbnail: "/about/followus.png"
  },
  {
    title: "Visual Learning",
    link: "#",
    thumbnail: "/about/Marketing1.png"
  },
  {
    title: "AI Assistant",
    link: "#",
    thumbnail: "/about/Landing.jpg"
  },
  {
    title: "Interactive Learning",
    link: "#",
    thumbnail: "/about/Chatpage.png"
  },
  {
    title: "Knowledge Maps",
    link: "#",
    thumbnail: "/about/usecase.png"
  },
  {
    title: "Smart Navigation",
    link: "#",
    thumbnail: "/about/presentation.png"
  },
  {
    title: "Intelligent Search",
    link: "#",
    thumbnail: "/about/ms.png"
  },
  {
    title: "Learning Assistant",
    link: "#",
    thumbnail: "/about/Landing.jpg"
  },
];

const About = () => {
  return (
    <PageLayout>
      {/* Parallax Section */}
      <div className="relative">
        <HeroParallax products={parallaxImages} />
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4 text-white">Team Colossus - SE42</h1>
        <p className="text-xl text-center mb-12 text-gray-300">Meet our talented team of developers and designers</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="relative group bg-black/30 backdrop-blur-lg rounded-xl p-6 border-2 border-white/20 transition-all duration-300 hover:bg-black/40"
            >
              {/* Image Container */}
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-gray-300 mb-6">{member.role}</p>
                
                {/* LinkedIn Button */}
                <Link
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-full hover:bg-[#084d93] transition-colors duration-300"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default About;