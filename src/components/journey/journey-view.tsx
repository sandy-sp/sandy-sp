"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY, type JourneyEntry } from "@/data/experience";
import { scene } from "@/components/scene/scene-state";
import { rebindScenes, scrollToTarget } from "@/components/motion/smooth-scroll";
import { Reveal } from "@/components/motion/reveal";

gsap.registerPlugin(ScrollTrigger);

type Mode = "interactive" | "basic";
const STORAGE_KEY = "journey-mode";

function readMode(): Mode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "basic" ? "basic" : "interactive";
  } catch {
    return "interactive";
  }
}

export function JourneyView() {
  const [mode, setMode] = useState<Mode>("interactive");
  const [active, setActive] = useState(0);
  const labelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // Restore the saved view after hydration so server and client markup match.
  useEffect(() => {
    const saved = readMode();
    if (saved !== "interactive") setMode(saved); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    scene.pins = JOURNEY.map((e) => ({ lat: e.place.lat, lon: e.place.lon }));
    scene.pinLabel = labelRef.current;
    return () => {
      scene.pinLabel = null;
    };
  }, []);

  // Sections changed: rebind scene triggers and track the active stop for the label.
  useLayoutEffect(() => {
    rebindScenes();
    if (mode !== "interactive" || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, listRef);
    return () => ctx.revert();
  }, [mode]);

  const choose = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    scrollToTarget("#journey-view");
  };

  const stop = JOURNEY[active];

  return (
    <div id="journey-view" className="relative">
      <div className="shell sticky top-20 z-20 flex justify-end py-4 md:top-24">
        <div role="tablist" aria-label="Journey view" className="flex border border-rule bg-ink">
          {(["interactive", "basic"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => choose(m)}
              className="t-mono px-4 py-2.5 transition-colors duration-[180ms] hover:text-bone aria-selected:bg-bone aria-selected:text-ink!"
            >
              {m === "interactive" ? "Globe" : "Basic"}
            </button>
          ))}
        </div>
      </div>

      {/* Follows the active pin on the globe; positioned every frame by LavaScene. */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 opacity-0"
        style={{ display: mode === "interactive" ? "block" : "none" }}
      >
        <div className="t-mono ml-6 -mt-2 whitespace-nowrap text-bone!">
          {stop.place.city}
          <span className="text-ash"> · {stop.year}</span>
        </div>
      </div>

      {mode === "interactive" ? (
        <InteractiveTimeline listRef={listRef} active={active} />
      ) : (
        <BasicTimeline />
      )}
    </div>
  );
}

function InteractiveTimeline({ listRef, active }: { listRef: React.RefObject<HTMLOListElement | null>; active: number }) {
  return (
    <div className="shell grid-12 relative">
      {/* Progress rail, pinned beside the globe. */}
      <div className="pointer-events-none col-span-12 hidden md:col-span-6 md:block">
        <div className="sticky top-[calc(100svh-7rem)] flex flex-wrap items-baseline gap-x-4 gap-y-2" aria-hidden="true">
          {JOURNEY.map((e, i) => (
            <span
              key={e.id}
              className={`t-mono transition-colors duration-[220ms] ${i === active ? "text-ember!" : i < active ? "text-bone!" : ""}`}
            >
              {e.year}
            </span>
          ))}
        </div>
      </div>

      <ol ref={listRef} className="col-span-12 pt-[48svh] md:col-span-5 md:col-start-8 md:pt-0">
        {JOURNEY.map((entry, i) => (
          <li
            key={entry.id}
            data-stop=""
            data-scene="globe"
            data-part={i}
            className="flex min-h-[85svh] items-center py-12"
          >
            <Stop entry={entry} index={i} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stop({ entry, index }: { entry: JourneyEntry; index: number }) {
  return (
    <Reveal className="w-full border-t border-rule bg-ink pt-6 md:bg-transparent">
      <p className="t-mono mb-4 flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-ember!">{String(index + 1).padStart(2, "0")} / {String(JOURNEY.length).padStart(2, "0")}</span>
        <span>{entry.kind === "education" ? "Education" : "Work"}</span>
        <span>
          {entry.place.city}, {entry.place.country}
          {entry.remote ? " · Remote" : ""}
        </span>
      </p>
      <h3 className="t-h3 mb-2">{entry.title}</h3>
      <p className="mb-1 text-bone">{entry.org}</p>
      <p className="t-mono mb-6">
        {entry.period}
        {entry.current ? " · Current" : ""}
      </p>
      <p className="t-body mb-6 text-ash">{entry.summary}</p>
      {entry.highlights.length > 0 && entry.kind === "work" && (
        <ul className="mb-6 flex flex-col gap-2">
          {entry.highlights.slice(0, 3).map((h) => (
            <li key={h} className="grid grid-cols-[1.25rem_minmax(0,1fr)] text-[0.9375rem] leading-relaxed text-ash">
              <span aria-hidden="true">—</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="t-mono leading-relaxed">{entry.skills.join(" · ")}</p>
    </Reveal>
  );
}

function BasicTimeline() {
  const roles = JOURNEY.filter((e) => e.kind === "work").reverse();
  const education = JOURNEY.filter((e) => e.kind === "education").reverse();

  return (
    <>
      <section data-scene="aside" className="shell pb-24 pt-8 md:pb-32">
        <h2 className="t-display-2 mb-12 md:mb-20">Experience</h2>
        <ol className="border-b border-rule">
          {roles.map((role) => (
            <li key={role.id} className="grid-12 gap-y-4 border-t border-rule py-12 md:py-16">
              <div className="col-span-12 md:col-span-3">
                <p className="t-mono">{role.period}</p>
                <p className="t-mono mt-2">
                  {role.place.city}
                  {role.remote ? " · Remote" : ""}
                </p>
                {role.current && <p className="t-mono mt-2 text-ember!">Current</p>}
              </div>
              <Reveal className="col-span-12 md:col-span-8 md:col-start-5">
                <h3 className="t-h3 mb-2">{role.title}</h3>
                <p className="mb-6 text-ash">{role.org}</p>
                <p className="t-body mb-8">{role.summary}</p>
                <ul className="mb-8 flex flex-col gap-3">
                  {role.highlights.map((h) => (
                    <li key={h} className="t-body grid grid-cols-[1.5rem_minmax(0,1fr)] text-ash">
                      <span aria-hidden="true">—</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <p className="t-mono leading-relaxed">{role.skills.join(" · ")}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section data-scene="aside" className="shell pb-24 md:pb-32">
        <h2 className="t-display-2 mb-12">Education</h2>
        <ol className="border-b border-rule">
          {education.map((ed) => (
            <li key={ed.id} className="grid-12 gap-y-3 border-t border-rule py-8">
              <p className="t-mono col-span-12 md:col-span-3">{ed.period}</p>
              <div className="col-span-12 md:col-span-8 md:col-start-5">
                <h3 className="mb-1 text-xl font-semibold tracking-[-0.02em]">{ed.title}</h3>
                <p className="mb-4 text-ash">
                  {ed.org} · {ed.place.city}
                </p>
                <p className="t-body text-ash">{ed.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
