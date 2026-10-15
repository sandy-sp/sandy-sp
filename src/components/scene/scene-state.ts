// Shared, mutable scene state. Written by DOM (scroll triggers, hovers, Lenis),
// read every frame by LavaScene. Never put this in React state.

export type SceneName =
  | "hero"
  | "approach"
  | "explore"
  | "contact"
  | "work"
  | "project"
  | "globe"
  | "globeIntro"
  | "projectAside"
  | "stack"
  | "stackIntro"
  | "page"
  | "aside";

export type SceneParams = {
  /** Form center, in fractions of the viewport half-size (-1..1). */
  x: number;
  y: number;
  scale: number;
  /** Blend weights. All zero = lava sphere. */
  nodes: number;
  line: number;
  ring: number;
  globe: number;
  modules: number;
  layers: number;
  /** 0 = full brightness, 1 = invisible. */
  dim: number;
};

const base = { nodes: 0, line: 0, ring: 0, globe: 0, modules: 0, layers: 0, dim: 0 };
const p = (v: Partial<SceneParams> & Pick<SceneParams, "x" | "y" | "scale">): SceneParams => ({ ...base, ...v });

const DESKTOP: Record<SceneName, SceneParams> = {
  hero: p({ x: 0.45, y: 0.2, scale: 0.85 }),
  approach: p({ x: -0.52, y: -0.5, scale: 0.55, nodes: 1, dim: 0.1 }),
  explore: p({ x: 0.52, y: -0.05, scale: 0.8 }),
  contact: p({ x: 0.6, y: 0.62, scale: 0.62, ring: 1 }),
  work: p({ x: 0.6, y: -0.02, scale: 0.8, modules: 1, dim: 0.1 }),
  project: p({ x: 0.55, y: 0.05, scale: 0.75, modules: 1, dim: 0.1 }),
  projectAside: p({ x: 1.1, y: 0.35, scale: 0.55, modules: 1, dim: 0.5 }),
  globe: p({ x: -0.5, y: -0.02, scale: 1.05, globe: 1 }),
  globeIntro: p({ x: 0.55, y: -0.12, scale: 0.85, globe: 1, dim: 0.05 }),
  stack: p({ x: -0.55, y: -0.05, scale: 0.75, layers: 1, dim: 0.1 }),
  stackIntro: p({ x: 0.55, y: -0.1, scale: 0.7, layers: 1, dim: 0.05 }),
  page: p({ x: 0.8, y: 0.6, scale: 0.45, dim: 0.4 }),
  aside: p({ x: 1.02, y: -0.15, scale: 0.5, nodes: 1, dim: 0.4 }),
};

// Phones: keep the form above or beside the text and dimmer so copy stays readable.
const MOBILE: Record<SceneName, SceneParams> = {
  hero: p({ x: 0.5, y: -0.8, scale: 0.4, dim: 0.1 }),
  approach: p({ x: 0.35, y: 0.6, scale: 0.45, nodes: 1, dim: 0.5 }),
  explore: p({ x: 0.6, y: 0.75, scale: 0.4, dim: 0.4 }),
  contact: p({ x: 0.45, y: 0.7, scale: 0.45, ring: 1, dim: 0.3 }),
  work: p({ x: 0.85, y: 0.75, scale: 0.45, modules: 1, dim: 0.5 }),
  project: p({ x: 0.6, y: 0.72, scale: 0.45, modules: 1, dim: 0.3 }),
  projectAside: p({ x: 1.0, y: 0.85, scale: 0.35, modules: 1, dim: 0.6 }),
  globe: p({ x: 0.0, y: 0.52, scale: 0.62, globe: 1, dim: 0.1 }),
  globeIntro: p({ x: 0.5, y: 0.7, scale: 0.5, globe: 1, dim: 0.2 }),
  stack: p({ x: 0.8, y: 0.75, scale: 0.4, layers: 1, dim: 0.45 }),
  stackIntro: p({ x: 0.55, y: 0.7, scale: 0.45, layers: 1, dim: 0.2 }),
  page: p({ x: 0.7, y: 0.75, scale: 0.4, dim: 0.55 }),
  aside: p({ x: 1.0, y: 0.85, scale: 0.35, nodes: 1, dim: 0.6 }),
};

export type Pin = {
  lat: number;
  lon: number;
  /** Unpinned waypoints the route bends through on the way to this pin. */
  via?: { lat: number; lon: number }[];
};

export const scene = {
  name: "hero" as SceneName,
  /** Temporary override while hovering a destination link. */
  preview: null as SceneName | null,
  /** Active part: module/layer index, or journey pin index. -1 = none. */
  part: -1,
  /** Part under the pointer; wins over `part` while set. */
  hoverPart: -1,
  /** Target heat from hovering interactive rows (0..1). */
  heat: 0,
  /** Absolute scroll velocity from Lenis, px/frame. */
  velocity: 0,
  /** Journey globe pins, oldest first. */
  pins: [] as Pin[],
  /** DOM label that follows the active globe pin. */
  pinLabel: null as HTMLElement | null,
};

export function setScene(name: SceneName, part = -1) {
  scene.name = name;
  scene.part = part;
}

export function setHeat(value: number) {
  scene.heat = value;
}

export function sceneParams(name: SceneName, mobile: boolean): SceneParams {
  return (mobile ? MOBILE : DESKTOP)[name];
}

