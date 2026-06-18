"use client";

import { useEffect, useState } from "react";

import { revealStyle, smoothstep } from "@/lib/scroll-motion";

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

// Fields reveal only after the network has spread (P ~0.58), finishing by the section-3
// snap (~0.66), then leave before SOCIAL.
const FIELD_START = 0.585;
const FIELD_STEP = 0.022;
const FIELD_WIN = 0.03;

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

  // Present only after the network has spread; gone before SOCIAL (above).
  const sectionVisible = progress > 0.56 && progress < 0.71;
  // Whole section lifts/blurs out as SOCIAL begins.
  const sectionOut = smoothstep(0.67, 0.71, progress);

  return (
    <div className="home-ai" style={{ visibility: sectionVisible ? "visible" : "hidden" }}>
      <div className="home-ai__inner">
        {FIELDS.map((field, i) => {
          const start = FIELD_START + i * FIELD_STEP;
          const cardIn = smoothstep(start, start + FIELD_WIN, progress);

          return (
            <article
              key={field.n}
              className="home-ai__card"
              style={revealStyle(cardIn, sectionOut)}
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
