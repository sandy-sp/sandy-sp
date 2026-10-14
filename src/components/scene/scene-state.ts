// Shared, mutable scene state. Written by DOM (scroll triggers, hovers, Lenis),
// read every frame by LavaScene. Never put this in React state.

export type SceneName = "hero" | "work" | "approach" | "journey" | "contact" | "page";

export type SceneParams = {
  /** Form center, in fractions of the viewport half-size (-1..1). */
  x: number;
  y: number;
  scale: number;
  /** 0 = single lava sphere, 1 = orbiting agent nodes. */
  nodes: number;
  /** 0 = nodes orbit, 1 = nodes line up into a thread. */
  line: number;
  /** 0..1 blend into a calm ring. */
  ring: number;
  /** 0 = full brightness, 1 = invisible. */
  dim: number;
};

const DESKTOP: Record<SceneName, SceneParams> = {
  hero: { x: 0.42, y: 0.02, scale: 1.0, nodes: 0, line: 0, ring: 0, dim: 0 },
  work: { x: 1.0, y: 0.55, scale: 0.55, nodes: 0, line: 0, ring: 0, dim: 0.35 },
  approach: { x: -0.52, y: -0.5, scale: 0.55, nodes: 1, line: 0, ring: 0, dim: 0.1 },
  journey: { x: 0.0, y: -0.95, scale: 0.6, nodes: 1, line: 1, ring: 0, dim: 0.55 },
  contact: { x: 0.6, y: 0.62, scale: 0.62, nodes: 0, line: 0, ring: 1, dim: 0 },
  page: { x: 0.8, y: 0.6, scale: 0.45, nodes: 0, line: 0, ring: 0, dim: 0.4 },
};

// Phones: keep the form above or behind the text and dimmer so copy stays readable.
const MOBILE: Record<SceneName, SceneParams> = {
  hero: { x: 0.55, y: 0.72, scale: 0.5, nodes: 0, line: 0, ring: 0, dim: 0.1 },
  work: { x: 1.0, y: 0.85, scale: 0.4, nodes: 0, line: 0, ring: 0, dim: 0.55 },
  approach: { x: 0.35, y: 0.6, scale: 0.6, nodes: 1, line: 0, ring: 0, dim: 0.5 },
  journey: { x: 0.0, y: 0.7, scale: 0.55, nodes: 1, line: 1, ring: 0, dim: 0.6 },
  contact: { x: 0.25, y: 0.55, scale: 0.75, nodes: 0, line: 0, ring: 1, dim: 0.35 },
  page: { x: 0.7, y: 0.75, scale: 0.4, nodes: 0, line: 0, ring: 0, dim: 0.55 },
};

export const scene = {
  name: "hero" as SceneName,
  /** Target heat from hovering a project row (0..1). */
  heat: 0,
  /** Absolute scroll velocity from Lenis, px/frame. */
  velocity: 0,
};

export function setScene(name: SceneName) {
  scene.name = name;
}

export function setHeat(value: number) {
  scene.heat = value;
}

export function sceneParams(name: SceneName, mobile: boolean): SceneParams {
  return (mobile ? MOBILE : DESKTOP)[name];
}
