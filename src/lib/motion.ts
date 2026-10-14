// Motion tokens. Mirrors MASTER.md > Motion. GSAP takes seconds.
export const EASE_OUT = "expo.out"; // ≈ cubic-bezier(.16, 1, .3, 1)
export const T_REVEAL = 0.9;
export const STAGGER = 0.04;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
