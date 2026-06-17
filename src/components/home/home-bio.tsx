"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { revealStyle, smoothstep } from "@/lib/scroll-motion";

// Phase 1 is P 0->0.32 (sphere -> tesseract). The bio types within it and the panel
// retires before phase 2 (the particle network / AI fields) begins.
const REVEAL_START = 0.12;
const REVEAL_END = 0.29;

type Part = { text: string; red?: boolean };
type Segment = { parts: Part[]; tag: "h2" | "p" };

const SEGMENTS: Segment[] = [
  { tag: "h2", parts: [{ text: "// A BIT MORE ABOUT YOURS TRULY", red: true }] },
  {
    tag: "p",
    parts: [
      { text: "Hey — I'm " },
      { text: "Sandeep", red: true },
      { text: ". You can also call me Sandy." },
    ],
  },
  { tag: "p", parts: [{ text: "9+ years in tech, and what pulls my focus keeps shifting." }] },
  {
    tag: "p",
    parts: [
      {
        text:
          "I'm a living case of “A jack of all trades is a master of none, but oftentimes better than a master of one.”",
        red: true,
      },
    ],
  },
  { tag: "p", parts: [{ text: "Started as a script junkie who taught himself to code." }] },
  {
    tag: "p",
    parts: [
      { text: "These days I'm deep in " },
      { text: "A.I.", red: true },
      { text: ", though I haven't locked onto a single sub-niche yet." },
    ],
  },
];

const segLength = (seg: Segment) => seg.parts.reduce((sum, p) => sum + p.text.length, 0);
const segText = (seg: Segment) => seg.parts.map((p) => p.text).join("");
const TOTAL_CHARS = SEGMENTS.reduce((sum, s) => sum + segLength(s), 0);
// Absolute character offset where each segment starts.
const SEGMENT_STARTS = SEGMENTS.map((_, i) =>
  SEGMENTS.slice(0, i).reduce((sum, s) => sum + segLength(s), 0),
);

export function HomeBio() {
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [revealChars, setRevealChars] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      // Progress spans the full document scroll range, so P always reaches 1 at the very
      // bottom no matter the spacer height. Pacing is controlled purely by the spacer
      // height in CSS (taller = slower). This avoids the spacer/MORPH_SPAN drift bug.
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;

      window.dispatchEvent(new CustomEvent("home-scroll", { detail: { progress } }));

      // Fade in during phase 1, then back out as phase 2 (AI fields) takes over.
      const panelIn = smoothstep(0.06, 0.15, progress);
      const panelOut = smoothstep(0.3, 0.34, progress);
      const visible = panelIn * (1 - panelOut);
      const panel = panelRef.current;
      const inner = innerRef.current;

      if (panel) {
        // Opacity on the panel so the mobile card background fades with the text.
        panel.style.opacity = `${visible}`;
        panel.style.pointerEvents = visible > 0.5 ? "auto" : "none";
      }

      if (inner) {
        // Directional rise + blur on the content (transform stays off the panel so the
        // mobile centering transform isn't clobbered).
        const s = revealStyle(panelIn, panelOut, reduced);
        inner.style.transform = s.transform as string;
        inner.style.filter = s.filter as string;
      }

      const charProgress = reduced
        ? progress > REVEAL_START
          ? 1
          : 0
        : smoothstep(REVEAL_START, REVEAL_END, progress);
      setRevealChars(Math.round(charProgress * TOTAL_CHARS));
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      // Reset the morph when leaving the home page.
      window.dispatchEvent(new CustomEvent("home-scroll", { detail: { progress: 0 } }));
    };
  }, []);

  return (
    <>
      <div className="home-bio__spacer" aria-hidden="true" />
      <div ref={panelRef} className="home-bio__panel">
        <div ref={innerRef} className="home-bio__inner">
        {SEGMENTS.map((seg, i) => {
          const segStart = SEGMENT_STARTS[i];

          const rendered = seg.parts.map((part, pi) => {
            const partStart =
              segStart + seg.parts.slice(0, pi).reduce((sum, prev) => sum + prev.text.length, 0);
            const partEnd = partStart + part.text.length;
            const visible = Math.max(0, Math.min(revealChars - partStart, part.text.length));
            const typing =
              revealChars < TOTAL_CHARS && revealChars > partStart && revealChars < partEnd;
            const redClass = part.red ? " home-bio__red" : "";

            return (
              <Fragment key={pi}>
                <span className={redClass.trim()} aria-hidden="true">
                  {part.text.slice(0, visible)}
                </span>
                {typing ? <span className="home-bio__caret" aria-hidden="true" /> : null}
                <span className={redClass.trim()} aria-hidden="true" style={{ opacity: 0 }}>
                  {part.text.slice(visible)}
                </span>
              </Fragment>
            );
          });

          const className = seg.tag === "h2" ? "home-bio__heading home-bio__red" : "home-bio__body";

          return seg.tag === "h2" ? (
            <h2 key={i} className={className} aria-label={segText(seg)}>
              {rendered}
            </h2>
          ) : (
            <p key={i} className={className} aria-label={segText(seg)}>
              {rendered}
            </p>
          );
        })}
        </div>
      </div>
    </>
  );
}
