"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Icons } from "./icons";

interface Testimonial {
  image: string;
  name: string;
  username: string;
  text: string;
  social: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  className?: string;
  title?: string;
  description?: string;
}

export function Testimonials({
  testimonials,
  className,
  title = "People Never Lie",
  description = "Hear from the people who uses visual roadmaps.",
}: TestimonialsProps) {
  const openInNewTab = (url: string) => {
    window.open(url, "_blank")?.focus();
  };

  return (
    <div className={cn("max-w-7xl mx-10 px-10", className)}>
      <div className="flex flex-col items-center justify-center pt-5">
        <div className="flex flex-col gap-5 mb-8">
          <h2 className="text-center text-4xl font-medium">{title}</h2>
          <p className="text-center text-muted-foreground">
            {description.split("<br />").map((line, i) => (
              <span key={i}>
                {line}
                {i !== description.split("<br />").length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center"
          )}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="w-[320px] h-[200px] p-5 relative bg-card border-border"
            >
              <div className="flex items-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex flex-col pl-4">
                  <span className="font-semibold text-base">
                    {testimonial.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {testimonial.username}
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-foreground font-medium line-clamp-3">
                  {testimonial.text}
                </p>
              </div>
              <button
                onClick={() => openInNewTab(testimonial.social)}
                className="absolute top-4 right-4 hover:opacity-80 transition-opacity"
              >
                <Icons.twitter className="h-4 w-4" aria-hidden="true" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
