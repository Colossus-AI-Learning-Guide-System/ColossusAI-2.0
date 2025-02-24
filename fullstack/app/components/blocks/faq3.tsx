import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import { AnimatedTooltip } from "../ui/animated-tooltip";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Faq3Props {
  heading: string;
  description: string;
  items?: FaqItem[];
  supportHeading: string;
  supportDescription: string;
  supportButtonText: string;
  supportButtonUrl: string;
}

const faqItems = [
  {
    id: "faq-1",
    question: "What is the return policy?",
    answer:
      "You can return any item within 30 days of purchase for a full refund, provided it is in its original condition.",
  },
  {
    id: "faq-2",
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you will receive an email with a tracking number. You can use this number on our website to track your order.",
  },
  {
    id: "faq-3",
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary depending on the destination.",
  },
  {
    id: "faq-4",
    question: "Can I change my order after it has been placed?",
    answer:
      "You can change your order within 24 hours of placing it by contacting our customer service team.",
  },
  {
    id: "faq-5",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay.",
  },
  {
    id: "faq-6",
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team via email at support@example.com or by calling 1-800-123-4567.",
  },
  {
    id: "faq-7",
    question: "Are there any discounts for bulk purchases?",
    answer:
      "Yes, we offer discounts for bulk purchases. Please contact our sales team for more information.",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Ruhan",
    designation: "Team Leader",
    image: "/team/ruhan.png",
  },
  {
    id: 2,
    name: "Tharana",
    designation: "Fullstack Developer",
    image: "/team/tharana.jpg",
  },
  {
    id: 3,
    name: "Sudesh",
    designation: "Fullstack Developer",
    image: "/team/sudesh.jpg",
  },
  {
    id: 4,
    name: "Pasidu",
    designation: "Fullstack Developer",
    image: "/team/pasidu.jpg",
  },
  {
    id: 5,
    name: "Chiran",
    designation: "Fullstack Developer",
    image: "/team/chiran.jpg",
  },
  {
    id: 6,
    name: "Akila",
    designation: "Fullstack Developer",
    image: "/team/akila.png",
  },
];

const Faq3 = ({
  heading = "Frequently asked questions",
  description = "Find answers to common questions about our products. Can't find what you're looking for? Contact our support team.",
  items = faqItems,
  supportHeading = "Need more support?",
  supportDescription = "Our dedicated support team is here to help you with any questions or concerns. Get in touch with us for personalized assistance.",
  supportButtonText = "Contact Support",
  supportButtonUrl = "https://www.shadcnblocks.com",
}: Faq3Props) => {
  return (
    <section className="py-32 flex justify-center items-center">
      <div className="container space-y-16 flex flex-col items-center">
        <div className="mx-auto flex max-w-3xl flex-col text-center">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-lg">{description}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto w-full lg:max-w-3xl"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                <div className="font-medium sm:py-1 lg:py-2 lg:text-lg">
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="sm:mb-1 lg:mb-2">
                <div className="text-muted-foreground lg:text-lg">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-lg bg-accent p-4 text-center md:rounded-xl md:p-6 lg:p-8">
          <h3 className="mb-2 max-w-3xl font-semibold lg:text-lg">
            {supportHeading}
          </h3>
          <p className="mb-8 max-w-3xl text-muted-foreground lg:text-lg">
            {supportDescription}
          </p>
          <AnimatedTooltip items={teamMembers} className="mt-8" />
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row mt-8">
            <Button
              className="w-full sm:w-auto px-6 py-3 text-lg bg-gradient-to-r from-[#FF4A8D] to-[#FF9F4A] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              asChild
            >
              <a href={supportButtonUrl}>{supportButtonText}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const demoData = {
  heading: "Frequently asked questions",
  description:
    "Everything you need to know about shadcnblocks. Can't find the answer you're looking for? Feel free to contact our support team.",
  items: [
    {
      id: "faq-1",
      question: "What is Colossus.AI?",
      answer:
        "Colossus.AI is an AI-powered Learning Guide System that generates visual learning roadmaps and knowledge graphs to help users easily navigate complex educational content.",
    },
    {
      id: "faq-2",
      question: "How does Colossus.AI work?",
      answer:
        "Colossus.AI processes uploaded documents and user queries to generate a structured Knowledge Graph. It highlights key concepts, relationships, and summaries, making it easier to understand dense academic or technical materials.",
    },
    {
      id: "faq-3",
      question: "Who can use Colossus.AI?",
      answer:
        "Our platform is designed for students, educators, researchers, and professionals who need to simplify complex study materials, research papers, or documentation.",
    },
    {
      id: "faq-4",
      question: "How do I start using Colossus.AI?",
      answer:
        "Simply create an account, upload your document, enter your query, and let the AI generate a structured roadmap for you.",
    },
    // Add more demo items as needed
  ],
  supportHeading: "Still have questions?",
  supportDescription:
    "Can't find the answer you're looking for? Our support team is here to help with any technical questions or concerns.",
  supportButtonText: "Contact Support",
  supportButtonUrl: "/contactus#contact-form",
};

const Faq3Demo = () => {
  return <Faq3 {...demoData} />;
};

export { Faq3, Faq3Demo };
