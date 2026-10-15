import { RevealText } from "@/components/motion/reveal";

export function Hero() {
  return (
    <section data-scene="hero" className="shell grid-12 relative content-start pb-6 pt-32 md:pb-8 md:pt-36">
      <div className="col-span-12 md:col-span-9 lg:col-span-8">
        <RevealText as="p" immediate className="t-mono t-eyebrow mb-8">
          Sandeep · Sandy-SP · AI Solutions Engineer
        </RevealText>
        <RevealText as="h1" immediate delay={0.1} className="t-display-1">
          I build AI systems that <span className="text-ash">ship.</span>
        </RevealText>
      </div>

      <div className="col-span-12 mt-12 md:mt-16">
        <RevealText as="p" immediate delay={0.35} className="t-lead max-w-none!">
          <span className="block">
            I&apos;ve worked in software since 2016, self-taught, across finance, web design, e-commerce and gaming.
          </span>
          <span className="block">
            In 2023 I turned my focus to AI and taught myself retrieval-augmented generation, multi-agent systems and
            agentic workflows.
          </span>
          <span className="block">
            I live in open-source tooling: I test new AI tools in my spare time and bring what holds up into my client
            and personal projects.
          </span>
        </RevealText>
      </div>
    </section>
  );
}
