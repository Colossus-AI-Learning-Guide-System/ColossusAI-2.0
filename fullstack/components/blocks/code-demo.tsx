"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[250px] pt-[250px]">
      {/* Video Dialog Section */}
      <div className="relative mb-32 max-w-[1400px] mx-auto px-8">
        <HeroVideoDialog
          className="dark:hidden block"
          animationStyle="from-center"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb&autoplay=1"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="from-center"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb&autoplay=1"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
          thumbnailAlt="Hero Video"
        />
      </div>

      {/* Scroll Animation Section */}
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Unleash the power of <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Scroll Animations
              </span>
            </h1>
          </>
        }
      >
        <div className="h-full w-full bg-[#1F2937] rounded-2xl flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white/80">
            Colossus.AI Demo
          </h2>
        </div>
      </ContainerScroll>
    </div>
  );
}
