"use client";

import Link from "next/link";
import { setHeat } from "@/components/scene/scene-state";
import type { Project } from "@/data/projects";

/** Project index row. Hovering heats the WebGL form. */
export function WorkRow({ project, index }: { project: Project; index: number }) {
  const heat = () => setHeat(1);
  const cool = () => setHeat(0);

  return (
    <Link
      href={`/work/${project.id}`}
      transitionTypes={["nav-forward"]}
      className="row group"
      onMouseEnter={heat}
      onMouseLeave={cool}
      onFocus={heat}
      onBlur={cool}
    >
      <span className="t-mono col-span-2 md:col-span-1">{String(index + 1).padStart(2, "0")}</span>
      <span className="col-span-10 md:col-span-5">
        <span className="row-name t-h3">{project.title}</span>
      </span>
      <span className="col-span-10 col-start-3 mt-2 text-ash md:col-span-4 md:col-start-auto md:mt-0">
        {project.summary}
      </span>
      <span className="t-mono col-span-10 col-start-3 mt-2 flex justify-between md:col-span-2 md:col-start-auto md:mt-0 md:justify-end md:gap-4">
        {project.kind}
        <span className="row-arrow" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
