"use client";

import Link from "next/link";
import { scene } from "@/components/scene/scene-state";
import { PROJECTS, type Project } from "@/data/projects";

/** Project index row. Hovering lifts and heats this project's module in the scene. */
export function WorkRow({ project, index }: { project: Project; index: number }) {
  // Props arrive serialized from the server, so match by id, not identity.
  const part = PROJECTS.findIndex((p) => p.id === project.id);
  const enter = () => {
    scene.hoverPart = part;
    scene.heat = 0.6;
  };
  const leave = () => {
    scene.hoverPart = -1;
    scene.heat = 0;
  };

  return (
    <Link
      href={`/work/${project.id}`}
      transitionTypes={["nav-forward"]}
      className="lift grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-rule py-6 md:py-7"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={leave}
    >
      <span className="t-mono">{String(index + 1).padStart(2, "0")}</span>
      <span className="min-w-0">
        <span className="row-name t-h3">
          {project.title}
        </span>
        <span className="mt-2 block text-ash">{project.summary}</span>
      </span>
      <span className="t-mono flex gap-3">
        {project.kind}
        <span className="row-arrow" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
