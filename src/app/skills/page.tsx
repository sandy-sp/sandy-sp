import type { Metadata } from "next";
import { SKILL_CATEGORIES } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";

export const metadata: Metadata = {
  title: "Stack",
  description: "The tools Sandeep Paidipati uses for AI systems, backends, cloud and front ends.",
};

export default function StackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stack"
        title="What I reach for."
        lead="Python and TypeScript most days. The model is rarely the hard part; retrieval, orchestration, infrastructure and evaluation usually are."
      />

      <section data-scene="aside" className="shell pb-24 md:pb-40">
        {SKILL_CATEGORIES.map((category, i) => (
          <div key={category.title} className="grid-12 gap-y-6 border-t border-rule py-12 last:border-b md:py-16">
            <div className="col-span-12 md:col-span-4">
              <p className="t-mono mb-3">{String(i + 1).padStart(2, "0")}</p>
              <RevealText as="h2" className="t-h3">
                {category.title}
              </RevealText>
            </div>
            <Reveal as="ul" stagger className="col-span-12 md:col-span-7 md:col-start-6">
              {category.skills.map((skill) => (
                <li key={skill} className="t-body border-b border-rule py-4 last:border-b-0">
                  {skill}
                </li>
              ))}
            </Reveal>
          </div>
        ))}
      </section>

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
