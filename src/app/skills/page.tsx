import type { Metadata } from "next";
import { SKILL_CATEGORIES } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";

export const metadata: Metadata = {
  title: "Stack",
  description: "The tools Sandy-SP uses for AI systems, backends, cloud and front ends.",
};

export default function StackPage() {
  return (
    <>
      <PageHeader
        scene="stackIntro"
        eyebrow="Stack · 4 layers"
        title="What I reach for."
        lead="Python and TypeScript most days. The model is rarely the hard part; retrieval, orchestration, infrastructure and evaluation usually are."
      />

      <div className="shell grid-12 pb-24 md:pb-40">
        <div className="col-span-12 md:col-span-6 md:col-start-7">
          {SKILL_CATEGORIES.map((category, i) => (
            <section
              key={category.title}
              data-scene="stack"
              data-part={i}
              className="flex min-h-[70svh] flex-col justify-center border-t border-rule py-12 last:border-b"
            >
              <p className="t-mono mb-3">
                <span className="text-ember!">{String(i + 1).padStart(2, "0")}</span> / {String(SKILL_CATEGORIES.length).padStart(2, "0")}
              </p>
              <RevealText as="h2" className="t-display-2 mb-8">
                {category.title}
              </RevealText>
              <Reveal as="ul" stagger>
                {category.skills.map((skill) => (
                  <li key={skill} className="t-body border-t border-rule py-4">
                    {skill}
                  </li>
                ))}
              </Reveal>
            </section>
          ))}
        </div>
      </div>

      <section className="shell">
        <div className="flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
          <p className="t-lead">See these tools used in real projects.</p>
          <RollLink href="/work" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
            View work
          </RollLink>
        </div>
      </section>
    </>
  );
}
