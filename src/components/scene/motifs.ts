// The nine work modules, laid out once per frame on the CPU and handed to the shader
// as uniforms. On the work index they form a 3x3 grid; on a project page they leave
// the grid and rearrange into a figure for that project.

export const MODULES = 9;

const PI = Math.PI;
const TAU = PI * 2;

/** Per-module output, written into flat arrays the shader reads directly. */
export type ModuleFrame = {
  /** Centers, xyz per module. */
  c: Float32Array;
  /** Half sizes, xyz per module. */
  b: Float32Array;
  /** Tilt about x, tilt about z, glow. */
  r: Float32Array;
  /** Group yaw, pitch. */
  view: Float32Array;
  /** Blend radius between modules (0 = hard edges). */
  k: number;
};

export function createModuleFrame(): ModuleFrame {
  return {
    c: new Float32Array(MODULES * 3),
    b: new Float32Array(MODULES * 3),
    r: new Float32Array(MODULES * 3),
    view: new Float32Array(2),
    k: 0,
  };
}

type Out = { c: [number, number, number]; b: [number, number, number]; rx: number; rz: number; glow: number };

const fract = (x: number) => x - Math.floor(x);
const mod = (x: number, y: number) => x - y * Math.floor(x / y);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// Gittxt: a file's lines as a stack of slabs that squeezes tight as it is packed.
function gittxt(i: number, t: number, o: Out) {
  const pack = 0.5 - 0.5 * Math.cos(t * 0.8);
  const hw = 0.45 + 0.4 * fract(Math.sin(i * 12.9898) * 43758.5453);
  o.c = [-0.75 + hw, (4 - i) * mix(0.25, 0.13, pack), 0];
  o.b = [hw, mix(0.085, 0.055, pack), 0.42];
  o.glow = pack * 0.7;
}

// ollama-scout: a gauge of growing model sizes; the needle sweeps and lifts what it reads.
function scout(i: number, t: number, o: Out) {
  const lo = PI * 1.08, hi = -PI * 0.08;
  const th = mix(lo, hi, i / 8);
  const needle = mix(lo, hi, 0.5 + 0.5 * Math.sin(t * 0.7));
  const k = Math.exp(-(th - needle) * (th - needle) * 10);
  const rad = 1.1 + k * 0.2;
  o.c = [Math.cos(th) * rad, Math.sin(th) * rad - 0.4, 0];
  const size = 0.1 + i * 0.017;
  o.b = [size * 0.75, size * (1 + k * 0.5), size * 0.75];
  o.rz = th - PI * 0.5;
  o.glow = k;
}

// Audionomy: a waveform of nine bars.
function audio(i: number, t: number, o: Out) {
  const env = 1 - Math.abs(i - 4) / 6;
  const h =
    0.1 + 0.65 * env * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.1)) * (0.55 + 0.45 * Math.sin(t * 1.7 - i * 0.6));
  o.c = [(i - 4) * 0.3, 0, 0];
  o.b = [0.09, h, 0.09];
  o.glow = smoothstep(0.3, 0.7, h);
}

// ChatAudit: a branching conversation; the kept thread lights up from the root.
const BRANCHES = [
  [0, -1.2, 0, -0.5],
  [0, -0.5, -0.6, 0.05],
  [0, -0.5, 0.6, 0.05],
  [-0.6, 0.05, -1.0, 0.6],
  [-0.6, 0.05, -0.25, 0.7],
  [0.6, 0.05, 0.25, 0.65],
  [0.6, 0.05, 1.0, 0.6],
  [-0.25, 0.7, -0.4, 1.25],
  [1.0, 0.6, 1.15, 1.1],
];
// Depth along the kept thread, -1 for pruned branches.
const KEPT = [0, 1, -1, -1, 2, -1, -1, 3, -1];
function chat(i: number, t: number, o: Out) {
  const [ax, ay, ex, ey] = BRANCHES[i];
  const sway = (x: number, y: number) => x + Math.sin(t * 0.8 + y * 1.5) * 0.05 * (y + 1.2);
  const sax = sway(ax, ay), sex = sway(ex, ey);
  const dx = sex - sax, dy = ey - ay;
  const depth = KEPT[i];
  const kept = depth >= 0 ? 1 : 0;
  const th = i === 0 ? 0.1 : mix(0.055, 0.075, kept);
  o.c = [(sax + sex) * 0.5, (ay + ey) * 0.5, 0];
  o.b = [th, Math.hypot(dx, dy) * 0.5 + th * 0.5, th];
  o.rz = Math.atan2(dy, dx) - PI * 0.5;
  const wave = mod(t * 1.2, 5);
  o.glow = kept * (0.2 + Math.exp(-(depth - wave) * (depth - wave) * 1.5));
}

// LinkedIn Post Studio: a post's layout typing itself in, line by line.
const LINE_WIDTHS = [0.9, 0.8, 0.86, 0.5];
function post(i: number, t: number, o: Out) {
  const prog = 0.5 - 0.5 * Math.cos(t * 0.5);
  if (i === 0) { o.c = [-0.72, 0.95, 0]; o.b = [0.16, 0.16, 0.07]; return; }
  if (i === 1) { o.c = [-0.12, 1.02, 0]; o.b = [0.4, 0.06, 0.06]; o.glow = 0.5; return; }
  if (i === 2) { o.c = [-0.24, 0.86, 0]; o.b = [0.28, 0.045, 0.06]; return; }
  if (i <= 6) {
    const line = i - 3;
    const f = smoothstep(0, 1, clamp01(prog * 5 - line));
    const w = Math.max(LINE_WIDTHS[line] * f, 0.06);
    o.c = [-0.9 + w, 0.55 - line * 0.17, 0];
    o.b = [w, 0.055, 0.06];
    o.glow = f * (1 - f) * 4;
    return;
  }
  if (i === 7) { o.c = [0, -0.5, 0]; o.b = [0.9, 0.34, 0.06]; return; }
  o.c = [0, -1.0, 0];
  o.b = [0.9, 0.04, 0.05];
  o.glow = 0.6;
}

// YTGrid: a play triangle of queued cubes; playback ripples through it.
function play(i: number, t: number, o: Out) {
  const col = i <= 4 ? 0 : i <= 7 ? 1 : 2;
  const j = i <= 4 ? i - 2 : i <= 7 ? i - 6 : 0;
  const w = Math.max(Math.sin(t * 2.5 - col * 1.4 - Math.abs(j) * 0.5), 0);
  o.c = [(col - 0.56) * 0.5, j * 0.42, w * 0.25];
  const s = 0.17 + w * 0.03;
  o.b = [s, s, s];
  o.glow = w;
}

// Metadata Cleaner: one file; tags peel off its corners and burn away.
function clean(i: number, t: number, o: Out) {
  if (i === 0) { o.c = [0, 0, 0]; o.b = [0.46, 0.46, 0.46]; return; }
  const k = i - 1;
  const dir = [mod(k, 2) * 2 - 1, mod(Math.floor(k / 2), 2) * 2 - 1, Math.floor(k / 4) * 2 - 1];
  const ph = fract(t * 0.16 + k * 0.125);
  const dist = (0.5 + ph * 0.9) * 0.95;
  o.c = [dir[0] * dist, dir[1] * dist, dir[2] * dist];
  const s = 0.14 * smoothstep(0, 0.15, ph) * (1 - smoothstep(0.35, 1, ph));
  o.b = [s, s, s];
  o.glow = smoothstep(0.05, 0.3, ph) * (1 - ph) * 1.5;
}

// AI Reply Index: a rolodex of response cards that flips one card at a time.
function index(i: number, t: number, o: Out) {
  const k = t * 0.45;
  const step = Math.floor(k) + smoothstep(0.4, 1, fract(k));
  const a = mod(((i + step) * TAU) / 9 + PI, TAU) - PI;
  o.c = [0, Math.cos(a) * 0.6, Math.sin(a) * 0.6];
  o.b = [0.66 - mod(i, 3) * 0.05, 0.36, 0.04];
  o.rx = a;
  o.glow = Math.pow(Math.max(Math.cos(a), 0), 12);
}

// Art of Data Analysis: the grid lies down as a bar chart; a seismic ripple runs through it.
function chart(i: number, t: number, o: Out) {
  const x = (mod(i, 3) - 1) * 0.5, z = (Math.floor(i / 3) - 1) * 0.5;
  const w = Math.sin(Math.hypot(x, z) * 5 - t * 2);
  const h = 0.12 + 0.4 * (0.35 + 0.25 * Math.sin(i * 2.3)) + 0.25 * (0.5 + 0.5 * w);
  o.c = [x, h - 0.55, z];
  o.b = [0.19, h, 0.19];
  o.glow = smoothstep(0.3, 1, w) * 0.8;
}

const MOTIFS = [gittxt, scout, audio, chat, post, play, clean, index, chart];

// How each motif is turned toward the viewer: base yaw, sway amount, pitch.
const VIEWS: [number, number, number][] = [
  [0.45, 0.3, 0.35],
  [0, 0.35, 0],
  [0.35, 0.3, -0.1],
  [0, 0.5, 0],
  [0.3, 0.2, -0.1],
  [0.3, 0.25, -0.1],
  [0.6, 0.5, -0.45],
  [0.55, 0.2, -0.2],
  [0.6, 0.4, 0.5],
];

const out: Out = { c: [0, 0, 0], b: [0, 0, 0], rx: 0, rz: 0, glow: 0 };

/**
 * Lays out the modules for this frame.
 * @param part active module on the grid (-1 = none), @param lift its eased lift,
 * @param project motif to form (-1 = grid), @param morph 0 = grid, 1 = motif.
 */
export function layoutModules(f: ModuleFrame, t: number, part: number, lift: number, project: number, morph: number) {
  const m = project >= 0 ? morph : 0;
  const sway = Math.sin(t * 0.25);
  const view = project >= 0 ? VIEWS[project] : VIEWS[0];
  f.view[0] = mix(0.55 + sway * 0.25, view[0] + sway * view[1], m);
  f.view[1] = mix(-0.3, view[2], m);
  // The conversation tree's branches melt into each other at the joints.
  f.k = project === 3 ? m * 0.08 : 0;

  // Active module pops toward the viewer and grows; the rest shrink back.
  const l = part >= 0 ? lift * (1 - m) : 0;
  const motif = project >= 0 ? MOTIFS[project] : null;

  for (let i = 0; i < MODULES; i++) {
    const active = i === part ? 1 : 0;
    const grow = 1 + active * l * 0.12;
    let cx = (mod(i, 3) - 1) * 0.68 * grow;
    let cy = (1 - Math.floor(i / 3)) * 0.68 * grow + Math.sin(t * 0.8 + i * 1.7) * 0.025;
    let cz = active * l * 0.6;
    const s = 0.26 + active * l * 0.07 - (1 - active) * l * 0.03;
    let bx = s, by = s, bz = s;
    let rx = 0, rz = 0, glow = 0;

    if (motif && m > 0.001) {
      // Modules leave the grid one after another.
      const mi = smoothstep(0, 1, clamp01(m * 1.5 - i / 16));
      out.c = [0, 0, 0];
      out.b = [s, s, s];
      out.rx = 0;
      out.rz = 0;
      out.glow = 0;
      motif(i, t, out);
      cx = mix(cx, out.c[0], mi);
      cy = mix(cy, out.c[1], mi);
      cz = mix(cz, out.c[2], mi);
      bx = mix(bx, out.b[0], mi);
      by = mix(by, out.b[1], mi);
      bz = mix(bz, out.b[2], mi);
      rx = out.rx * mi;
      rz = out.rz * mi;
      glow = out.glow * mi;
    }

    f.c.set([cx, cy, cz], i * 3);
    f.b.set([bx, by, bz], i * 3);
    f.r.set([rx, rz, glow], i * 3);
  }
}
