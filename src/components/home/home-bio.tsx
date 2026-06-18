"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { revealStyle, smoothstep } from "@/lib/scroll-motion";

// Section 2 = P 0 -> 0.40 (sphere -> tesseract). The whole section's scroll is the morph;
// once it's formed (~P 0.40, the section-2 snap) the bio types in automatically (time-based,
// not scroll-bound). Panel fades both ways: in 0.36->0.40, out 0.46->0.52.
const TYPE_TRIGGER = 0.4; // start typing once the tesseract has formed
const TYPE_RESET_LOW = 0.36; // scrolled back toward the sphere -> reset for a re-type
const TYPE_RESET_HIGH = 0.5; // moved on toward the network -> reset
const TYPE_SECONDS = 2.4; // time to type the whole bio

type Part = { text: string; red?: boolean };
type Segment = { parts: Part[]; tag: "h2" | "p" };

const SEGMENTS: Segment[] = [
  { tag: "h2", parts: [{ text: "// A BIT MORE ABOUT YOURS TRULY", red: true }] },
  {
    tag: "p",
    parts: [
      { text: "Hey, I'm " },
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
  { tag: "p", parts: [{ text: "Started as a script junkie and taught myself to code." }] },
  {
    tag: "p",
    parts: [
      { text: "These days I'm deep in " },
      { text: "Artificial Intelligence", red: true },
      { text: ", though I haven't locked onto a single speciality yet." },
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
  const progressRef = useRef(0);
  const [revealChars, setRevealChars] = useState(0);

  // Scroll: dispatch progress, drive panel fade in/out (both directions), stash progress.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      // Progress spans the full document scroll range, so P always reaches 1 at the bottom.
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
      progressRef.current = progress;

      window.dispatchEvent(new CustomEvent("home-scroll", { detail: { progress } }));

      // Panel fades in as the tesseract finishes; fades out FIRST (before the network
      // spreads) when the user scrolls on from section 2.
      const panelIn = smoothstep(0.36, 0.4, progress);
      const panelOut = smoothstep(0.41, 0.47, progress);
      const visible = panelIn * (1 - panelOut);
      const panel = panelRef.current;
      const inner = innerRef.current;

      if (panel) {
        panel.style.opacity = `${visible}`;
        panel.style.pointerEvents = visible > 0.5 ? "auto" : "none";
      }

      if (inner) {
        const s = revealStyle(panelIn, panelOut, reduced);
        inner.style.transform = s.transform as string;
        inner.style.filter = s.filter as string;
      }
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
      window.dispatchEvent(new CustomEvent("home-scroll", { detail: { progress: 0 } }));
    };
  }, []);

  // Typewriter: time-based (not scroll-bound). Once the tesseract has formed and we're in
  // the about zone, the bio types itself out; it resets when we scroll away so it re-types.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = TOTAL_CHARS / TYPE_SECONDS;
    let chars = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = progressRef.current;
      const inZone = p >= TYPE_RESET_LOW && p <= TYPE_RESET_HIGH;

      if (!inZone) {
        chars = 0;
      } else if (reduced) {
        chars = p >= TYPE_TRIGGER ? TOTAL_CHARS : 0;
      } else if (p >= TYPE_TRIGGER) {
        chars = Math.min(TOTAL_CHARS, chars + speed * dt);
      }

      // Hold the scroll while the bio is actively typing at the section-2 stop, then release.
      const lock = !reduced && chars > 0.5 && chars < TOTAL_CHARS && p >= TYPE_TRIGGER && p < 0.46;
      document.documentElement.classList.toggle("scroll-locked", lock);

      setRevealChars((prev) => (Math.round(chars) !== prev ? Math.round(chars) : prev));
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      document.documentElement.classList.remove("scroll-locked");
    };
  }, []);

  return (
    <>
      {/* Scroll track split into 4 snap blocks; each block top lands on a section
          (hero / about / focus / social). Total height = pacing for the morph. */}
      {["420vh", "273vh", "347vh", "110vh"].map((height, i) => (
        <div key={i} className="home-snap" style={{ height }} aria-hidden="true" />
      ))}
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
