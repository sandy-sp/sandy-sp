import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "@/data/projects";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { CopyCommand } from "@/components/ui/copy-command";
import { RollLink } from "@/components/ui/roll-link";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).id);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const index = PROJECTS.indexOf(project);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <>
      <PageHeader scene="project" part={index} eyebrow={`${project.kind} · ${project.category}`} title={project.title} lead={project.summary} />

      <section data-scene="projectAside" data-part={index} className="shell grid-12 gap-y-16 pb-24 md:pb-40">
        <div className="col-span-12 flex flex-col gap-16 md:col-span-7">
          <div>
            <p className="t-mono mb-6">About</p>
            <RevealText as="p" className="t-lead">
              {project.description}
            </RevealText>
          </div>

          <div>
            <p className="t-mono mb-6">What it does</p>
            <Reveal as="ul" stagger className="border-b border-rule">
              {project.features.map((feature) => (
                <li key={feature} className="t-body border-t border-rule py-5">
                  {feature}
                </li>
              ))}
            </Reveal>
          </div>

          {project.notes && (
            <div>
              <p className="t-mono mb-6">How it&apos;s built</p>
              <RevealText as="p" className="t-body text-ash">
                {project.notes}
              </RevealText>
            </div>
          )}
        </div>

        <aside className="col-span-12 md:col-span-4 md:col-start-9">
          <Reveal stagger className="flex flex-col gap-10 md:sticky md:top-32">
            {project.installCommand && (
              <div>
                <p className="t-mono mb-4">Install</p>
                <CopyCommand command={project.installCommand} />
              </div>
            )}
            <div>
              <p className="t-mono mb-4">Stack</p>
              <ul className="border-b border-rule">
                {project.technologies.map((tech) => (
                  <li key={tech} className="border-t border-rule py-3">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3">
              <p className="t-mono mb-1">Links</p>
              <RollLink href={project.githubUrl} suffix={<span className="ml-2">↗</span>}>
                Source on GitHub
              </RollLink>
              {project.packageUrl && (
                <RollLink href={project.packageUrl} suffix={<span className="ml-2">↗</span>}>
                  Package on PyPI
                </RollLink>
              )}
            </div>
          </Reveal>
        </aside>
      </section>

      <section data-scene="project" data-part={PROJECTS.indexOf(next)} className="shell">
        <Link
          href={`/work/${next.id}`}
          transitionTypes={["nav-forward"]}
          className="row group border-b border-rule"
        >
          <span className="t-mono col-span-12 mb-4 md:col-span-2 md:mb-0">Next project</span>
          <span className="col-span-11 md:col-span-9">
            <span className="row-name t-display-2">{next.title}</span>
          </span>
          <span className="row-arrow t-h3 col-span-1 text-right" aria-hidden="true">→</span>
        </Link>
        <div className="mt-8">
          <RollLink href="/work" suffix={<span className="ml-2">←</span>}>
            All projects
          </RollLink>
        </div>
      </section>
    </>
  );
}
