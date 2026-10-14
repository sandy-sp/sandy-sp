import type { Metadata } from "next";
import { PROJECTS, type Project } from "@/data/projects";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { WorkRow } from "@/components/home/work-row";

export const metadata: Metadata = {
  title: "Work",
  description: "Open-source tools by Sandeep Paidipati: LLM context packing, local model sizing, audio datasets, privacy utilities.",
};

const GROUPS: Project["category"][] = ["AI & LLM", "Developer Tools", "Data & Analytics"];

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Work · ${PROJECTS.length} projects`}
        title="Tools I build in the open."
        lead="Most of these started as fixes for problems I kept hitting at work: getting a codebase into a model, picking a model my machine can run, cleaning data before it's used for training."
      />

      {GROUPS.map((group) => {
        const projects = PROJECTS.filter((p) => p.category === group);
        return (
          <section key={group} data-scene="work" className="shell pb-24 md:pb-32">
            <div className="grid-12 mb-8 items-end">
              <RevealText as="h2" className="t-h3 col-span-9">
                {group}
              </RevealText>
              <p className="t-mono col-span-3 text-right">{String(projects.length).padStart(2, "0")}</p>
            </div>
            <Reveal stagger className="border-b border-rule">
              {projects.map((project, i) => (
                <WorkRow key={project.id} project={project} index={i} />
              ))}
            </Reveal>
          </section>
        );
      })}
    </>
  );
}
