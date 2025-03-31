import { Testimonials } from "./testimonials";

const testimonials = [
  {
    image: "/feedback-users/6.jpeg",
    text: "Colossus.AI has redefined how I learn. The AI-generated roadmaps simplify complex topics, making studying more intuitive and engaging!",
    name: "Rifa",
    username: "@Rifa.B",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "/feedback-users/5.jpeg",
    text: "This tool has significantly streamlined my research process. The knowledge graphs and structured roadmaps help me retain information effortlessly!",
    name: "Neluki Hamangoda",
    username: "@Nelukihamangoda",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "/feedback-users/4.jpeg",
    text: "I love how well-structured and interactive the roadmaps are. They provide clarity and help me see the bigger picture of any topic I study!",
    name: "Ashfaq Farleen",
    username: "@Ashfaqfarleen",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "/feedback-users/3.jpeg",
    text: "Colossus.AI has transformed the way I approach coursework. Instead of spending hours sifting through documents, I now get structured insights instantly!",
    name: "Rimaz Khan",
    username: "@Rimazkhan",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "/feedback-users/2.jpeg",
    text: "The knowledge graph generation feature is revolutionary! It organizes information in a way that makes studying feel effortless.",
    name: "Nashan Unais",
    username: "@Nashanunais",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "/feedback-users/1.jpeg",
    text: "As a visual learner, Colossus.AI has been a lifesaver. The roadmap system keeps me on track and improves my retention of complex subjects.",
    name: "Mohomed Vilan",
    username: "@Mohomedvilan",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
];

export function TestimonialsDemo() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="container">
        <Testimonials testimonials={testimonials} />
      </div>
    </div>
  );
}
