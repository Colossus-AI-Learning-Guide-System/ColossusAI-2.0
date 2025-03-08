import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "../../components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl">
          <div className="flex animate-marquee gap-6 py-4">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex shrink-0 gap-6">
                {testimonials.map((testimonial, i) => (
                  <TestimonialCard
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                    className="shrink-0"
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-[200px] bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[200px] bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}
