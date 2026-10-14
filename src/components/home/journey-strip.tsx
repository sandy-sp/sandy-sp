import { EXPERIENCES } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { RollLink } from "@/components/ui/roll-link";

export function JourneyStrip() {
  const roles = EXPERIENCES.filter((e) => e.type !== "education");

  return (
    <section data-scene="journey" className="section shell">
      <div className="grid-12 mb-12 items-end gap-y-6 md:mb-20">
        <RevealText as="h2" className="t-display-2 col-span-12 md:col-span-8">
          Where I&apos;ve worked
        </RevealText>
        <p className="t-mono col-span-12 md:col-span-4 md:text-right">2016 — now</p>
      </div>

      <Reveal as="ol" stagger className="border-b border-rule">
        {roles.map((role) => (
          <li key={role.id} className="row">
            <span className="t-mono col-span-12 mb-2 md:col-span-3 md:mb-0">{role.period}</span>
            <span className="col-span-12 text-lg font-medium tracking-[-0.01em] md:col-span-5">{role.role}</span>
            <span className="col-span-12 text-ash md:col-span-4">{role.company}</span>
          </li>
        ))}
      </Reveal>

      <div className="mt-10">
        <RollLink href="/journey" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
          Full journey and education
        </RollLink>
      </div>
    </section>
  );
}
