import type { Metadata } from "next";
import { CERTIFICATIONS, EXPERIENCES } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";

export const metadata: Metadata = {
  title: "Journey",
  description: "Sandeep Paidipati's experience: AI engineering at OrbisQ and Magnifying Minds, full-stack and QA work before that, and degrees in information systems, electrical engineering and psychology.",
};

export default function JourneyPage() {
  const roles = EXPERIENCES.filter((e) => e.type !== "education");
  const education = EXPERIENCES.filter((e) => e.type === "education");

  return (
    <>
      <PageHeader
        eyebrow="Journey · 2016 — now"
        title="Ten years, three disciplines."
        lead="Electrical engineering taught me systems. Psychology taught me how people decide. Information systems taught me how organizations run on data. I use all three when building AI that people have to work alongside."
      />

      <section data-scene="aside" className="shell pb-24 md:pb-40">
        <RevealText as="h2" className="t-display-2 mb-12 md:mb-20">
          Experience
        </RevealText>
        <ol className="border-b border-rule">
          {roles.map((role) => (
            <li key={role.id} className="grid-12 gap-y-4 border-t border-rule py-12 md:py-16">
              <div className="col-span-12 md:col-span-3">
                <p className="t-mono">{role.period}</p>
                {role.current && <p className="t-mono mt-2 text-ember!">Current</p>}
              </div>
              <Reveal className="col-span-12 md:col-span-8 md:col-start-5">
                <h3 className="t-h3 mb-2">{role.role}</h3>
                <p className="mb-6 text-ash">
                  {role.company} · {role.location}
                </p>
                <p className="t-body mb-8">{role.description}</p>
                <ul className="mb-8 flex flex-col gap-3">
                  {role.highlights.map((h) => (
                    <li key={h} className="t-body grid grid-cols-[1.5rem_minmax(0,1fr)] text-ash">
                      <span aria-hidden="true">—</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <p className="t-mono leading-relaxed">{role.skills.join(" · ")}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section data-scene="aside" className="shell grid-12 gap-y-16 pb-24 md:pb-40">
        <div className="col-span-12 md:col-span-6">
          <RevealText as="h2" className="t-display-2 mb-12">
            Education
          </RevealText>
          <ol className="border-b border-rule">
            {education.map((ed) => (
              <li key={ed.id} className="border-t border-rule py-8">
                <p className="t-mono mb-3">{ed.period}</p>
                <h3 className="mb-1 text-xl font-semibold tracking-[-0.02em]">{ed.role}</h3>
                <p className="mb-4 text-ash">{ed.company}</p>
                <p className="t-body text-ash">{ed.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <RevealText as="h2" className="t-display-2 mb-12">
            Certifications
          </RevealText>
          <Reveal as="ul" stagger className="border-b border-rule">
            {CERTIFICATIONS.map((c) => (
              <li key={c.title} className="border-t border-rule py-6">
                <p className="font-medium">{c.title}</p>
                <p className="t-mono mt-2">{c.issuer}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="shell">
        <div className="flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
          <p className="t-lead">Want the details behind any of this?</p>
          <RollLink href="/#contact" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
            Get in touch
          </RollLink>
        </div>
      </section>
    </>
  );
}
