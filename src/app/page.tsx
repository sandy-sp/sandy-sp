import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { Approach } from "@/components/home/approach";
import { JourneyStrip } from "@/components/home/journey-strip";
import { Contact } from "@/components/home/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <Approach />
      <JourneyStrip />
      <Contact />
    </>
  );
}
