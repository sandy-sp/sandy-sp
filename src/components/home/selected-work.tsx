import { PROJECTS } from "@/data/projects";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { RollLink } from "@/components/ui/roll-link";
import { WorkRow } from "./work-row";

export function SelectedWork() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section id="work" data-scene="work" className="section shell">
      <div className="grid-12 mb-12 items-end gap-y-6 md:mb-20">
        <RevealText as="h2" className="t-display-2 col-span-12 md:col-span-8">
          Selected work
        </RevealText>
        <p className="t-mono col-span-12 md:col-span-4 md:text-right">
          {featured.length} of {PROJECTS.length} open-source projects
        </p>
      </div>

      <Reveal stagger className="border-b border-rule">
        {featured.map((project, i) => (
          <WorkRow key={project.id} project={project} index={i} />
        ))}
      </Reveal>

      <div className="mt-10">
        <RollLink href="/work" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
          All projects
        </RollLink>
      </div>
    </section>
  );
}
