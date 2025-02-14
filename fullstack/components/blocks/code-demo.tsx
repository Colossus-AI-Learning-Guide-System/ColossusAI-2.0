"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]">
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
