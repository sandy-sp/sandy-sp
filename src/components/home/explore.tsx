"use client";

import Link from "next/link";
import { scene, type SceneName } from "@/components/scene/scene-state";
import { PROJECTS } from "@/data/projects";
import { JOURNEY } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";

const DESTINATIONS: { href: string; name: string; note: string; meta: string; preview: SceneName }[] = [
  {
    href: "/work",
    name: "Work",
    note: "Open-source tools for LLM context, local models, audio data and privacy.",
    meta: `${PROJECTS.length} projects`,
    preview: "work",
  },
  {
    href: "/journey",
    name: "Journey",
    note: "From QA in Hyderabad to AI engineering in the US, on a globe.",
    meta: `${JOURNEY.length} stops`,
    preview: "globe",
  },
  {
    href: "/skills",
    name: "Stack",
    note: "The tools I use across AI, backend, cloud and front end.",
    meta: "4 layers",
    preview: "stack",
  },
];

/** Index of inner pages. Hovering a row previews that page's form in the scene. */
export function Explore() {
  const show = (name: SceneName) => () => {
    scene.preview = name;
  };
  const clear = () => {
    scene.preview = null;
  };

  return (
    <section data-scene="explore" className="section shell grid-12">
      <div className="col-span-12 md:col-span-6">
        <RevealText as="h2" className="t-display-2 mb-12 md:mb-16">
          Explore
        </RevealText>
        <Reveal stagger className="border-b border-rule">
          {DESTINATIONS.map((d, i) => (
            <Link
              key={d.href}
              href={d.href}
              transitionTypes={["nav-forward"]}
              className="row group"
              onMouseEnter={show(d.preview)}
              onMouseLeave={clear}
              onFocus={show(d.preview)}
              onBlur={clear}
              onClick={clear}
            >
              <span className="t-mono col-span-2 sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="col-span-10 sm:col-span-7">
                <span className="row-name t-display-2">{d.name}</span>
              </span>
              <span className="t-mono col-span-10 col-start-3 mt-2 flex justify-between sm:col-span-4 sm:col-start-auto sm:mt-0 sm:justify-end sm:gap-4">
                {d.meta}
                <span className="row-arrow" aria-hidden="true">→</span>
              </span>
              <span className="col-span-10 col-start-3 mt-3 text-ash sm:col-span-11 sm:col-start-2">{d.note}</span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
