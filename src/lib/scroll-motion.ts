import type { CSSProperties } from "react";

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Shared scroll-reveal vocabulary: enter from below (fade + blur-in + slight scale),
// exit upward (faster). `inProgress` ramps 0->1 as the element enters; optional
// `outProgress` ramps 0->1 as it leaves. Returns inline styles for scroll-scrubbing.
export function revealStyle(inProgress: number, outProgress = 0, reduced = false): CSSProperties {
  const opacity = inProgress * (1 - outProgress);

  // Reduced motion: fade only, no travel or blur.
  if (reduced) {
    return { opacity, transform: "none", filter: "none" };
  }

  // Enter rises up from +1.8rem; exit lifts up to -1.2rem (exit travel a touch shorter).
  const rise = (1 - inProgress) * 1.8 - outProgress * 1.2;
  const blur = ((1 - inProgress) + outProgress) * 5;
  const scale = 0.97 + 0.03 * inProgress - 0.02 * outProgress;

  return {
    opacity,
    transform: `translate3d(0, ${rise.toFixed(3)}rem, 0) scale(${scale.toFixed(3)})`,
    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
  };
}
