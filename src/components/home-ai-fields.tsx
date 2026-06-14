"use client";

import { useEffect, useState } from "react";

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type Field = { n: string; title: string; body: string };

const FIELDS: Field[] = [
  {
    n: "01",
    title: "Multi-Agent Orchestration",
    body: "Agentic AI systems — orchestrating multiple agents, automation, and autonomous end-to-end pipelines.",
  },
  {
    n: "02",
    title: "Prompt Engineering & Fine-Tuning",
    body: "Prompt engineering and fine-tuning LLMs for specific, high-signal use cases.",
  },
  {
    n: "03",
    title: "AI Research",
    body: "Researching and creating new methods and techniques in AI.",
  },
];

// Each field reveals in its own slice of phase 2 (P 0.32 -> 0.62), after the about-me
// panel has left and before SOCIAL (phase 3) begins.
const FIELD_START = 0.36;
const FIELD_STEP = 0.07;

export function HomeAiFields() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      setProgress(detail?.progress ?? 0);
    };

    window.addEventListener("home-scroll", handle);

    return () => window.removeEventListener("home-scroll", handle);
  }, []);

  // Only present during phase 2; gone before about-me (below) and SOCIAL (above).
  const sectionVisible = progress > 0.33 && progress < 0.67;
  // Whole section fades out as SOCIAL (phase 3) begins.
  const sectionFade = 1 - smoothstep(0.6, 0.66, progress);

  return (
    <div className="home-ai" style={{ visibility: sectionVisible ? "visible" : "hidden" }}>
      <div className="home-ai__inner">
        {FIELDS.map((field, i) => {
          const start = FIELD_START + i * FIELD_STEP;
          const visible = smoothstep(start, start + 0.08, progress) * sectionFade;

          return (
            <article
              key={field.n}
              className="home-ai__card"
              style={{ opacity: visible, transform: `translateY(${(1 - visible) * 1.6}rem)` }}
            >
              <span className="home-ai__num">{`${field.n} //`}</span>
              <h2 className="home-ai__title">{field.title}</h2>
              <p className="home-ai__body">{field.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
