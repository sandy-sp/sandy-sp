import { RevealText, Reveal } from "@/components/motion/reveal";
import { RollLink } from "@/components/ui/roll-link";

export function Hero() {
  return (
    <section data-scene="hero" className="shell grid-12 relative min-h-svh content-end pb-16 pt-40 md:pb-24">
      <div className="col-span-12 md:col-span-9 lg:col-span-8">
        <RevealText as="p" immediate className="t-mono mb-8">
          Sandeep · Sandy SP · AI Solutions Engineer
        </RevealText>
        <RevealText as="h1" immediate delay={0.1} className="t-display-1">
          I build AI systems that <span className="text-ash">ship.</span>
        </RevealText>
      </div>

      <div className="col-span-12 mt-12 grid-12 gap-y-10 border-t border-rule pt-6 md:mt-20">
        <RevealText as="p" immediate delay={0.35} className="t-lead col-span-12 md:col-span-6">
          Since 2016 I&apos;ve shipped software for games, schools and enterprises. Since 2023 that means
          retrieval pipelines, multi-agent workflows, and the evaluation suites that keep them honest.
        </RevealText>
        <Reveal className="col-span-12 flex flex-col gap-3 md:col-span-3 md:col-start-8" stagger>
          <span className="t-mono">Now</span>
          <span>AI Automation Engineer, OrbisQ</span>
          <span className="text-ash">Remote · United States</span>
        </Reveal>
        <Reveal className="col-span-12 flex flex-col items-start gap-3 md:col-span-2 md:col-start-11 md:items-end" stagger>
          <span className="t-mono">Elsewhere</span>
          <RollLink href="https://github.com/sandy-sp">GitHub</RollLink>
          <RollLink href="https://www.linkedin.com/in/sandy-sp/">LinkedIn</RollLink>
        </Reveal>
      </div>
    </section>
  );
}
