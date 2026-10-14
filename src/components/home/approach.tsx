"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealText } from "@/components/motion/reveal";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    stage: "Retrieve",
    title: "Ground every answer in a source.",
    body: "Chunk documents by meaning rather than character count, combine vector search with keyword search, re-rank, and return citations with every answer so people can check it.",
    tools: "Pinecone · pgvector · BM25 · re-rankers",
  },
  {
    stage: "Orchestrate",
    title: "Small agents with clear contracts.",
    body: "Each agent gets one job, typed tool schemas, and a budget. A critic step reviews the output before anything is written back. State lives in a graph you can replay.",
    tools: "LangGraph · LangChain · FastAPI · AsyncIO",
  },
  {
    stage: "Evaluate",
    title: "Measure before it ships.",
    body: "Evaluation suites run in CI like unit tests. Every production failure becomes a regression case, so the same mistake is caught the next time.",
    tools: "Ragas · DeepEval · Docker · GitHub Actions",
  },
];

export function Approach() {
  const ref = useRef<HTMLElement>(null);

  // The step nearest the middle of the viewport is bright; the others recede.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => step.toggleAttribute("data-active", self.isActive),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} data-scene="approach" className="section shell grid-12 gap-y-16">
      <div className="col-span-12 md:col-span-5">
        <div className="md:sticky md:top-32">
          <p className="t-mono mb-6">How I build</p>
          <RevealText as="h2" className="t-display-2">
            Three habits that keep AI systems honest.
          </RevealText>
        </div>
      </div>

      <ol className="col-span-12 md:col-span-6 md:col-start-7">
        {STEPS.map((step, i) => (
          <li
            key={step.stage}
            data-step=""
            className="group border-t border-rule py-12 transition-opacity duration-500 last:border-b md:py-20 md:opacity-55 md:data-active:opacity-100"
          >
            <p className="t-mono mb-6 flex gap-4">
              <span className="text-ember">{String(i + 1).padStart(2, "0")}</span>
              {step.stage}
            </p>
            <h3 className="t-h3 mb-5">{step.title}</h3>
            <p className="t-body mb-6 text-ash">{step.body}</p>
            <p className="t-mono">{step.tools}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
