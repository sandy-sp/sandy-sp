"use client";

import { useEffect, useRef } from "react";

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const biographyBlocks = [
  { year: "2024 //", title: "AGENTIC AI SYSTEMS", body: "Designing autonomous multi-agent pipelines and Gen AI application architecture." },
  { year: "2022 //", title: "GEN AI ENGINEERING", body: "Shipping LLM-backed products: retrieval, tool-use orchestration, evaluation harnesses." },
  { year: "2020 //", title: "FULL-STACK FOUNDATION", body: "Cloud-native services, data pipelines, and developer tooling at scale." },
  { year: "2018 //", title: "ORIGIN VECTOR", body: "Software engineering roots — systems thinking, performance, and clean abstractions." },
];

export function TimelineStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    // Lock scroll on the root scrolling element until the globe locks onto India;
    // the intro is a fixed sequence. Released on earth-rotation-locked.
    root.classList.add("scroll-locked");

    let frame = 0;

    const update = () => {
      frame = 0;
      const zone = window.innerHeight;
      const progress = zone > 0 ? Math.min(Math.max(window.scrollY / zone, 0), 1) : 0;

      window.dispatchEvent(new CustomEvent("earth-zoom", { detail: { progress } }));

      const column = columnRef.current;

      if (column) {
        const visible = smoothstep(0.4, 0.92, progress);
        column.style.opacity = `${visible}`;
        column.style.pointerEvents = visible > 0.5 ? "auto" : "none";
      }
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const enableScroll = () => {
      root.classList.remove("scroll-locked");
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("earth-rotation-locked", enableScroll, { once: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("earth-rotation-locked", enableScroll);
      root.classList.remove("scroll-locked");
    };
  }, []);

  return (
    <div ref={trackRef} className="timeline-stage" aria-hidden="false">
      <div ref={columnRef} className="timeline-column">
        <p className="timeline-column__eyebrow">{"// BIOGRAPHY_TRACK"}</p>
        <ol className="timeline-column__list">
          {biographyBlocks.map((block) => (
            <li key={block.year} className="timeline-block">
              <span className="timeline-block__year">{block.year}</span>
              <h2 className="timeline-block__title">{block.title}</h2>
              <p className="timeline-block__body">{block.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
