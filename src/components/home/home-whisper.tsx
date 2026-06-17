"use client";

import { useEffect, useState } from "react";

// Pure pseudo-random in [0,1) for stable per-character dissolve delays.
function seeded(n: number) {
  const x = Math.sin(n * 91.7 + 47.3) * 43758.5453;
  return x - Math.floor(x);
}

type Seg = { t: string; c?: string };

const LINES: Seg[][] = [
  [{ t: "Oh, didn't see you there " }, { t: "ツ", c: "home-whisper__face" }],
  [{ t: "Now, " }, { t: "WHY DON'T YOU SCROLL DOWN", c: "home-whisper__shout" }],
  [
    { t: "To Know More About " },
    { t: "ME", c: "home-whisper__me" },
    { t: " " },
    { t: "↓", c: "home-whisper__arrow" },
  ],
];

// Global running character index where each [line][segment] starts (built once at load,
// so render never mutates anything). Drives per-character random dissolve delays.
const SEG_BASES: number[][] = (() => {
  let n = 0;
  return LINES.map((line) =>
    line.map((seg) => {
      const base = n;
      n += Array.from(seg.t).length;
      return base;
    }),
  );
})();

export function HomeWhisper() {
  const [isReady, setIsReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // The seeded per-char delays use Math.sin, which serializes with different float
  // precision on server vs client. Apply them only after mount to avoid a hydration
  // mismatch (which would otherwise leave the subtree un-patched).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if ((window as typeof window & { __sphereSpun?: boolean }).__sphereSpun) {
      const id = window.requestAnimationFrame(() => setIsReady(true));
      return () => window.cancelAnimationFrame(id);
    }

    const handleSpinStart = () => setIsReady(true);
    window.addEventListener("sphere-spin-start", handleSpinStart, { once: true });

    return () => window.removeEventListener("sphere-spin-start", handleSpinStart);
  }, []);

  // On scroll, each character dissolves into the background at its own random moment.
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      setIsScrolled(Boolean(detail) && detail.progress > 0.02);
    };

    window.addEventListener("home-scroll", handleScroll);

    return () => window.removeEventListener("home-scroll", handleScroll);
  }, []);

  return (
    <div className={`home-whisper${isReady ? " home-whisper--visible" : ""}`} aria-hidden={!isReady}>
      {LINES.map((line, li) => (
        <p key={li}>
          {line.map((seg, si) => (
            <span key={si} className={seg.c}>
              {Array.from(seg.t).map((ch, ci) => {
                const i = SEG_BASES[li][si] + ci;
                return (
                  <span
                    key={i}
                    className="home-whisper__char"
                    style={{
                      // Each character fades in (and later out) at its own random moment.
                      opacity: isReady && !isScrolled ? 1 : 0,
                      transitionDelay: mounted ? `${seeded(i) * 0.6}s` : "0s",
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
