import { HeroSection } from "@/components/home/hero-section";
import { ArchitectureVisualizer } from "@/components/home/architecture-visualizer";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ContactSection } from "@/components/home/contact-section";

export default function Home() {
  return (
    <div className="relative z-10 w-full flex flex-col">
      <HeroSection />
      <ArchitectureVisualizer />
      <FeaturedProjects />
      <ContactSection />
    </div>
  );
}
