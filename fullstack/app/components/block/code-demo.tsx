"use client";
import React from "react";
import { ContainerScroll } from "../../components/ui/container-scroll-animation";
import { HeroVideoDialog } from "../../components/ui/hero-video-dialog";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[250px] pt-[250px]">
      {/* Video Dialog Section */}
      <div className="relative mb-32 max-w-[1400px] mx-auto px-8">
        <HeroVideoDialog
          className="dark:hidden block"
          animationStyle="from-center"
          videoSrc="/Scroll Animation/Sample Graph.mp4"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="from-center"
          videoSrc="/Scroll Animation/Sample Graph.mp4"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
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
                Roadmap Generation
              </span>
            </h1>
          </>
        }
      >
        <div className="h-full w-full bg-[#1F2937] rounded-2xl flex flex-col items-center justify-center">
          <video
            className="w-full h-full object-cover rounded-none"
            autoPlay
            loop
            muted
          >
            <source src="/Scroll Animation/Sample Graph.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </ContainerScroll>
    </div>
  );
}
