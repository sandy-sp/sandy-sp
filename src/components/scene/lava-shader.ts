export const VERTEX = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const MAX_PINS = 16;

// Raymarched signed-distance form. One field blends between a lava sphere,
// agent nodes, a ring, a dotted globe, a grid of modules and a stack of layers.
// Mixing SDFs is not exact, so the march under-steps to stay stable mid-morph;
// a form passing through another briefly melts through lava, which is intended.
export const FRAGMENT = /* glsl */ `
precision highp float;

#define MAX_PINS ${MAX_PINS}
#define PI 3.14159265
#define TAU 6.28318531

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // world units
uniform float uMouseOn;  // 0..1
uniform vec2 uOffset;    // world units
uniform float uScale;
uniform float uNodes;
uniform float uLine;
uniform float uRing;
uniform float uGlobe;
uniform float uModules;
uniform float uLayers;
uniform float uDim;
uniform float uHeat;
uniform float uFlow;
uniform float uPart;     // active module / layer index, -1 = none
uniform float uPartLift; // 0..1 eased lift of the active part
uniform float uProject;  // project whose motif the modules form, -1 = none
uniform float uMorph;    // 0 = grid, 1 = motif

uniform mat3 uGlobeRot;  // world -> globe-local
uniform sampler2D uLand; // equirectangular land mask
uniform float uLandReady;
uniform vec3 uPins[MAX_PINS]; // lat, lon (radians), state: 0 future, 1 past, 2 active; +4 = waypoint, no dot
uniform float uPinCount;

const float CAM_Z = 7.2;
const float FOCAL = 3.8;

vec3 hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0;
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
        mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
    mix(mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
        mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y),
    u.z);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdCylinder(vec3 p, float r, float h, float round) {
  vec2 d = vec2(length(p.xz) - r + round, abs(p.y) - h + round);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - round;
}

// ---------- forms ----------

float field(vec3 q, float amp) {
  return noise(q * 1.6 + vec3(0.0, uTime * 0.25, 0.0)) * 0.32 * amp
       + noise(q * 3.4 - uTime * 0.2) * 0.09 * amp;
}

float sdBlob(vec3 q, float amp) {
  return length(q) - (1.0 + field(q, amp));
}

float sdNodes(vec3 q) {
  float d = length(q) - 0.42 * (1.0 - uLine);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float a = fi * 2.0944 + uTime * 0.35;
    vec3 orbit = vec3(cos(a) * 1.35, sin(a * 2.0 + fi) * 0.28, sin(a) * 1.35);
    vec3 thread = vec3((fi - 1.0) * 1.3, sin(uTime * 0.6 + fi * 1.3) * 0.12, 0.0);
    vec3 c = mix(orbit, thread, uLine);
    float r = 0.3 + noise(q * 2.5 + fi * 7.0 + uTime * 0.3) * 0.06;
    d = smin(d, length(q - c) - r, 0.38);
  }
  return d;
}

// Enso: one open brush stroke. Heavy where the brush lands, thinning to a dry tail,
// with a gap where the circle never closes. Faces the viewer and sways slightly.
float sdRing(vec3 q) {
  q.xz = rot(sin(uTime * 0.3) * 0.35) * q.xz;
  q.yz = rot(0.2 + sin(uTime * 0.23) * 0.1) * q.yz;

  const float START = 1.9;  // where the brush lands (radians, counter-clockwise from +x)
  const float GAP = 0.8;    // unpainted arc
  float span = 2.0 * PI - GAP;
  float u = mod(atan(q.y, q.x) - START, 2.0 * PI) / span;
  // Inside the gap, snap to whichever end of the stroke is nearer.
  if (u > 1.0) u = u > 1.0 + 0.5 * GAP / span ? 0.0 : 1.0;

  float a = START + u * span;
  float r = 1.12 + 0.05 * sin(a * 3.0 + 0.6) - 0.1 * u * u;
  vec3 c = vec3(cos(a) * r, sin(a) * r, 0.0);
  float th = mix(0.26, 0.05, pow(u, 0.8));
  float dry = noise(q * 6.0 + uTime * 0.2) * 0.05 * u;
  return length(q - c) - th + dry - noise(q * 2.2 + uTime * 0.25) * 0.03;
}

// ---------- project motifs ----------
// On a project page the nine modules leave the grid and rearrange into a figure for
// that project. Each motif places module i: c = center, b = half size, r = tilt about
// x and z, glow = extra heat. Angles stay bounded so the morph never spins wildly.

// Gittxt: a file's lines as a stack of slabs that squeezes tight as it is packed.
void motifGittxt(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float pack = 0.5 - 0.5 * cos(t * 0.8);
  float hw = 0.45 + 0.4 * fract(sin(fi * 12.9898) * 43758.5453);
  c = vec3(-0.75 + hw, (4.0 - fi) * mix(0.25, 0.13, pack), 0.0);
  b = vec3(hw, mix(0.085, 0.05, pack), 0.42);
  r = vec2(0.0);
  glow = pack * 0.7;
}

// ollama-scout: a gauge of growing model sizes; the needle sweeps and lifts what it reads.
void motifScout(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float lo = PI * 1.08, hi = -PI * 0.08;
  float th = mix(lo, hi, fi / 8.0);
  float needle = mix(lo, hi, 0.5 + 0.5 * sin(t * 0.7));
  float k = exp(-(th - needle) * (th - needle) * 10.0);
  vec2 dir = vec2(cos(th), sin(th));
  c = vec3(dir * (1.1 + k * 0.2), 0.0) - vec3(0.0, 0.4, 0.0);
  float size = 0.1 + fi * 0.017;
  b = vec3(size * 0.75, size * (1.0 + k * 0.5), size * 0.75);
  r = vec2(0.0, th - PI * 0.5);
  glow = k;
}

// Audionomy: a waveform of nine bars.
void motifAudio(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float env = 1.0 - abs(fi - 4.0) / 6.0;
  float h = 0.1 + 0.65 * env * (0.5 + 0.5 * sin(t * 3.0 + fi * 1.1)) * (0.55 + 0.45 * sin(t * 1.7 - fi * 0.6));
  c = vec3((fi - 4.0) * 0.3, 0.0, 0.0);
  b = vec3(0.09, h, 0.09);
  r = vec2(0.0);
  glow = smoothstep(0.3, 0.7, h);
}

// ChatAudit: a branching conversation; the kept thread lights up from the root.
vec4 chatBranch(float i) {
  if (i < 0.5) return vec4(0.0, -1.2, 0.0, -0.5);
  if (i < 1.5) return vec4(0.0, -0.5, -0.6, 0.05);
  if (i < 2.5) return vec4(0.0, -0.5, 0.6, 0.05);
  if (i < 3.5) return vec4(-0.6, 0.05, -1.0, 0.6);
  if (i < 4.5) return vec4(-0.6, 0.05, -0.25, 0.7);
  if (i < 5.5) return vec4(0.6, 0.05, 0.25, 0.65);
  if (i < 6.5) return vec4(0.6, 0.05, 1.0, 0.6);
  if (i < 7.5) return vec4(-0.25, 0.7, -0.4, 1.25);
  return vec4(1.0, 0.6, 1.15, 1.1);
}
vec2 chatSway(vec2 p, float t) {
  return p + vec2(sin(t * 0.8 + p.y * 1.5) * 0.05 * (p.y + 1.2), 0.0);
}
void motifChat(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  vec4 seg = chatBranch(fi);
  vec2 a = chatSway(seg.xy, t);
  vec2 e = chatSway(seg.zw, t);
  vec2 d = e - a;
  float depth = fi < 0.5 ? 0.0 : fi < 1.5 ? 1.0 : fi > 3.5 && fi < 4.5 ? 2.0 : fi > 6.5 && fi < 7.5 ? 3.0 : -1.0;
  float kept = step(0.0, depth);
  float th = fi < 0.5 ? 0.1 : mix(0.045, 0.07, kept);
  c = vec3((a + e) * 0.5, 0.0);
  b = vec3(th, length(d) * 0.5 + th * 0.5, th);
  r = vec2(0.0, atan(d.y, d.x) - PI * 0.5);
  float wave = mod(t * 1.2, 5.0);
  glow = kept * (0.2 + exp(-(depth - wave) * (depth - wave) * 1.5));
}

// LinkedIn Post Studio: a post's layout typing itself in, line by line.
void motifPost(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float prog = 0.5 - 0.5 * cos(t * 0.5);
  r = vec2(0.0);
  glow = 0.0;
  if (fi < 0.5) { c = vec3(-0.72, 0.95, 0.0); b = vec3(0.16, 0.16, 0.06); return; }
  if (fi < 1.5) { c = vec3(-0.12, 1.02, 0.0); b = vec3(0.4, 0.055, 0.04); glow = 0.5; return; }
  if (fi < 2.5) { c = vec3(-0.24, 0.86, 0.0); b = vec3(0.28, 0.035, 0.04); return; }
  if (fi < 6.5) {
    float line = fi - 3.0;
    float hw = line < 0.5 ? 0.9 : line < 1.5 ? 0.8 : line < 2.5 ? 0.86 : 0.5;
    float f = smoothstep(0.0, 1.0, clamp(prog * 5.0 - line, 0.0, 1.0));
    float w = max(hw * f, 0.04);
    c = vec3(-0.9 + w, 0.55 - line * 0.17, 0.0);
    b = vec3(w, 0.04, 0.04);
    glow = f * (1.0 - f) * 4.0;
    return;
  }
  if (fi < 7.5) { c = vec3(0.0, -0.5, 0.0); b = vec3(0.9, 0.34, 0.04); return; }
  c = vec3(0.0, -1.0, 0.0);
  b = vec3(0.9, 0.025, 0.03);
  glow = 0.6;
}

// YTGrid: a play triangle of queued cubes; playback ripples through it.
void motifPlay(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float col = fi < 4.5 ? 0.0 : fi < 7.5 ? 1.0 : 2.0;
  float j = fi < 4.5 ? fi - 2.0 : fi < 7.5 ? fi - 6.0 : 0.0;
  float w = max(sin(t * 2.5 - col * 1.4 - abs(j) * 0.5), 0.0);
  c = vec3((col - 0.56) * 0.5, j * 0.42, w * 0.25);
  b = vec3(0.17 + w * 0.03);
  r = vec2(0.0);
  glow = w;
}

// Metadata Cleaner: one file; tags peel off its corners and burn away.
void motifClean(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  r = vec2(0.0);
  if (fi < 0.5) { c = vec3(0.0); b = vec3(0.46); glow = 0.0; return; }
  float k = fi - 1.0;
  vec3 dir = vec3(mod(k, 2.0), mod(floor(k / 2.0), 2.0), floor(k / 4.0)) * 2.0 - 1.0;
  float ph = fract(t * 0.16 + k * 0.125);
  c = dir * (0.5 + ph * 0.9) * 0.95;
  b = vec3(0.14 * smoothstep(0.0, 0.1, ph) * (1.0 - smoothstep(0.35, 1.0, ph)));
  glow = smoothstep(0.05, 0.3, ph) * (1.0 - ph) * 1.5;
}

// AI Reply Index: a rolodex of response cards that flips one card at a time.
void motifIndex(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  float k = t * 0.45;
  float stepT = floor(k) + smoothstep(0.55, 1.0, fract(k));
  float a = mod((fi + stepT) * TAU / 9.0 + PI, TAU) - PI;
  c = vec3(0.0, cos(a), sin(a)) * 0.6;
  b = vec3(0.66 - mod(fi, 3.0) * 0.05, 0.36, 0.022);
  r = vec2(a, 0.0);
  glow = pow(max(cos(a), 0.0), 12.0);
}

// Art of Data Analysis: the grid lies down as a bar chart; a seismic ripple runs through it.
void motifChart(float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  vec2 xz = vec2(mod(fi, 3.0) - 1.0, floor(fi / 3.0) - 1.0) * 0.5;
  float w = sin(length(xz) * 5.0 - t * 2.0);
  float h = 0.12 + 0.4 * (0.35 + 0.25 * sin(fi * 2.3)) + 0.25 * (0.5 + 0.5 * w);
  c = vec3(xz.x, h - 0.55, xz.y);
  b = vec3(0.19, h, 0.19);
  r = vec2(0.0);
  glow = smoothstep(0.3, 1.0, w) * 0.8;
}

void motif(float proj, float fi, float t, out vec3 c, out vec3 b, out vec2 r, out float glow) {
  if (proj < 0.5) motifGittxt(fi, t, c, b, r, glow);
  else if (proj < 1.5) motifScout(fi, t, c, b, r, glow);
  else if (proj < 2.5) motifAudio(fi, t, c, b, r, glow);
  else if (proj < 3.5) motifChat(fi, t, c, b, r, glow);
  else if (proj < 4.5) motifPost(fi, t, c, b, r, glow);
  else if (proj < 5.5) motifPlay(fi, t, c, b, r, glow);
  else if (proj < 6.5) motifClean(fi, t, c, b, r, glow);
  else if (proj < 7.5) motifIndex(fi, t, c, b, r, glow);
  else motifChart(fi, t, c, b, r, glow);
}

// How each motif is turned toward the viewer: yaw, pitch.
vec2 motifView(float proj, float t) {
  float sway = sin(t * 0.25);
  if (proj < 0.5) return vec2(0.45 + sway * 0.3, 0.35);
  if (proj < 1.5) return vec2(sway * 0.35, 0.0);
  if (proj < 2.5) return vec2(0.35 + sway * 0.3, -0.1);
  if (proj < 3.5) return vec2(sway * 0.5, 0.0);
  if (proj < 4.5) return vec2(0.3 + sway * 0.2, -0.1);
  if (proj < 5.5) return vec2(0.3 + sway * 0.25, -0.1);
  if (proj < 6.5) return vec2(0.6 + sway * 0.5, -0.45);
  if (proj < 7.5) return vec2(0.55 + sway * 0.2, -0.2);
  return vec2(0.6 + sway * 0.4, 0.5);
}

float partGlow = 0.0;

// 3x3 grid of rounded modules, one per project. Active one slides forward;
// on a project page the grid morphs into that project's motif.
float sdModules(vec3 q, out float id) {
  float m = uMorph * step(0.0, uProject);
  vec2 view = m > 0.001 ? motifView(uProject, uTime) : vec2(0.0);
  q.xz = rot(mix(0.55 + sin(uTime * 0.25) * 0.25, view.x, m)) * q.xz;
  q.yz = rot(mix(-0.3, view.y, m)) * q.yz;
  // The conversation tree's branches melt into each other at the joints.
  float k = m * 0.08 * (1.0 - step(0.5, abs(uProject - 3.0)));
  float d = 1e3;
  id = -1.0;
  partGlow = 0.0;
  // Active module pops toward the viewer and grows; the rest shrink back.
  float lift = uPartLift * (uPart < 0.0 ? 0.0 : 1.0) * (1.0 - m);
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec3 c = vec3(mod(fi, 3.0) - 1.0, 1.0 - floor(fi / 3.0), 0.0) * 0.68;
    float active = 1.0 - step(0.5, abs(fi - uPart));
    c.z += active * lift * 0.6;
    c.xy *= 1.0 + active * lift * 0.12;
    c.y += sin(uTime * 0.8 + fi * 1.7) * 0.025;
    vec3 b = vec3(0.26 + active * lift * 0.07 - (1.0 - active) * lift * 0.03);
    vec2 r = vec2(0.0);
    float g = 0.0;
    if (m > 0.001) {
      // Modules leave the grid one after another.
      float mi = smoothstep(0.0, 1.0, clamp(m * 1.5 - fi / 16.0, 0.0, 1.0));
      vec3 mc, mb; vec2 mr; float mg;
      motif(uProject, fi, uTime, mc, mb, mr, mg);
      c = mix(c, mc, mi);
      b = mix(b, mb, mi);
      r = mr * mi;
      g = mg * mi;
    }
    vec3 p = q - c;
    p.yz = rot(r.x) * p.yz;
    p.xy = rot(r.y) * p.xy;
    float bd = sdRoundBox(p, b, min(0.07, min(b.x, min(b.y, b.z)) * 0.9));
    if (bd < d) { id = fi; partGlow = g; }
    d = k > 0.001 ? smin(d, bd, k) : min(d, bd);
  }
  return d;
}

// Four stacked plates, one per stack category. Active one slides out.
float sdLayers(vec3 q, out float id) {
  q.yz = rot(0.42) * q.yz;
  q.xz = rot(uTime * 0.18) * q.xz;
  float d = 1e3;
  id = -1.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float active = 1.0 - step(0.5, abs(fi - uPart));
    vec3 c = vec3(active * uPartLift * 0.55, (1.5 - fi) * 0.44 + active * uPartLift * 0.06, 0.0);
    float r = 0.95 - fi * 0.06 + active * uPartLift * 0.08;
    float b = sdCylinder(q - c, r, 0.075, 0.05);
    if (b < d) { d = b; id = fi; }
  }
  return d;
}

float partId = -1.0;

float map(vec3 p) {
  vec3 q0 = (p - vec3(uOffset, 0.0)) / uScale;
  vec3 q = q0;
  q.xz = rot(uTime * 0.15) * q.xz;

  // Pointer pulls the surface toward it.
  vec3 mp = vec3((uMouse - uOffset) / uScale, 0.9);
  float pull = exp(-dot(q0 - mp, q0 - mp) * 2.2) * 0.3 * uMouseOn;

  float d = sdBlob(q, 1.0 + uFlow) - pull;
  if (uNodes > 0.001) d = mix(d, sdNodes(q) - pull * 0.5, uNodes);
  if (uRing > 0.001) d = mix(d, sdRing(q), uRing);
  if (uGlobe > 0.001) d = mix(d, length(q0) - 1.0 - pull * 0.15, uGlobe);
  partId = -1.0;
  if (uModules > 0.001) {
    float id;
    d = mix(d, sdModules(q0, id) - pull * 0.2, uModules);
    partId = id;
  }
  if (uLayers > 0.001) {
    float id;
    d = mix(d, sdLayers(q0, id) - pull * 0.2, uLayers);
    partId = id;
  }
  return d * uScale;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)));
}

// ---------- materials ----------

vec3 lava(vec3 q, vec3 n, vec3 rd, float extraHeat) {
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.4);
  float dif = max(dot(n, normalize(vec3(-0.5, 0.8, 0.6))), 0.0);
  float core = noise(q * 2.2 + uTime * 0.3) * 0.5 + 0.5;
  float h = clamp(uHeat + extraHeat, 0.0, 1.5);

  vec3 oxblood = vec3(0.30, 0.05, 0.035);
  vec3 ember = vec3(0.95, 0.29, 0.16);
  vec3 hot = vec3(1.0, 0.72, 0.45);

  vec3 col = mix(oxblood * 0.35, oxblood, dif);
  col = mix(col, ember, smoothstep(0.45 - h * 0.15, 0.95, core) * (0.35 + 0.65 * dif + h * 0.35));
  col += hot * pow(smoothstep(0.7 - h * 0.1, 1.0, core), 3.0) * (0.6 + h * 0.5);
  col += ember * fres * 0.9;
  return col;
}

vec3 pinDir(vec2 ll) {
  return vec3(cos(ll.x) * sin(ll.y), sin(ll.x), cos(ll.x) * cos(ll.y));
}

vec3 globe(vec3 q0, vec3 n, vec3 rd) {
  vec3 g = uGlobeRot * normalize(q0);
  float lat = asin(clamp(g.y, -1.0, 1.0));
  float lon = atan(g.x, g.z);

  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.6);
  float dif = max(dot(n, normalize(vec3(-0.4, 0.6, 0.8))), 0.0);

  vec3 ink = vec3(0.06, 0.05, 0.045);
  vec3 bone = vec3(0.93, 0.9, 0.86);
  vec3 ember = vec3(0.95, 0.29, 0.16);
  vec3 col = ink + vec3(0.05, 0.012, 0.01) * dif;

  // Dot-matrix land: rows of dots spaced evenly by latitude, mask sampled at each dot center.
  float stepLat = PI / 90.0;
  float row = floor((lat + PI * 0.5) / stepLat);
  float latC = (row + 0.5) * stepLat - PI * 0.5;
  float count = max(1.0, floor(cos(latC) * 180.0));
  float stepLon = 2.0 * PI / count;
  float colIdx = floor((lon + PI) / stepLon);
  float lonC = (colIdx + 0.5) * stepLon - PI;
  float land = texture2D(uLand, vec2((lonC + PI) / (2.0 * PI), (PI * 0.5 - latC) / PI)).r * uLandReady;
  vec2 dd = vec2((lon - lonC) * cos(lat), lat - latC);
  float dotMask = smoothstep(stepLat * 0.34, stepLat * 0.22, length(dd)) * land;
  col = mix(col, bone * (0.22 + 0.45 * dif), dotMask);

  // Travelled path and pins.
  float pulse = fract(uTime * 0.6);
  for (int i = 0; i < MAX_PINS; i++) {
    if (float(i) >= uPinCount) break;
    vec3 pin = uPins[i];
    float via = step(3.5, pin.z);
    float state = pin.z - via * 4.0;
    vec3 pd = pinDir(pin.xy);
    float ang = acos(clamp(dot(g, pd), -1.0, 1.0));

    if (i > 0 && state > 0.5) {
      vec3 a = pinDir(uPins[i - 1].xy);
      vec3 c = cross(a, pd);
      float cl = length(c);
      if (cl > 0.01) {
        vec3 nn = c / cl;
        float off = abs(dot(g, nn));
        float inside = step(0.0, dot(cross(a, g), nn)) * step(0.0, dot(cross(g, pd), nn));
        col = mix(col, ember * 0.8, smoothstep(0.006, 0.002, off) * inside * (state > 1.5 ? 1.0 : 0.6));
      }
    }

    if (via > 0.5) continue;
    if (state > 1.5) {
      col = mix(col, vec3(1.0, 0.55, 0.38), smoothstep(0.03, 0.018, ang));
      float ringR = 0.035 + pulse * 0.07;
      col += ember * smoothstep(0.008, 0.0, abs(ang - ringR)) * (1.0 - pulse) * 1.2;
    } else if (state > 0.5) {
      col = mix(col, ember * 0.85, smoothstep(0.02, 0.012, ang));
    } else {
      col = mix(col, bone * 0.4, smoothstep(0.015, 0.009, ang));
    }
  }

  col += ember * fres * 0.55;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, CAM_Z);
  vec3 rd = normalize(vec3(uv, -FOCAL));

  vec3 ink = vec3(0.043, 0.039, 0.035);
  vec3 col = ink;

  // Skip the march when the ray misses the form's bounding sphere.
  vec3 oc = ro - vec3(uOffset, 0.0);
  float br = 2.7 * uScale;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - br * br;
  float disc = b * b - c;

  // World size of one pixel per unit of ray distance, for edge coverage.
  float pixel = 2.0 / (uRes.y * FOCAL);
  bool hit = false;
  float t = 0.0;
  // Closest approach to the surface, relative to the pixel footprint there.
  float edge = 1e3;
  float tEdge = 0.0;
  if (disc > 0.0) {
    t = max(-b - sqrt(disc), 0.0);
    float tMax = -b + sqrt(disc);
    for (int i = 0; i < 64; i++) {
      float h = map(ro + rd * t);
      if (h < 0.0015) { hit = true; break; }
      float e = h / (pixel * t);
      if (e < edge) { edge = e; tEdge = t; }
      t += h * 0.75;
      if (t > tMax) break;
    }
  }

  // Rays that graze the form get partial coverage instead of a hard cut-off.
  float cover = 1.0;
  if (!hit && edge < 1.5) {
    hit = true;
    t = tEdge;
    cover = 1.0 - smoothstep(0.0, 1.5, edge);
  }

  vec3 bg = ink;
  {
    float dist = length(uv - uOffset / (CAM_Z / FOCAL));
    bg += vec3(0.22, 0.04, 0.03) * exp(-dist * 2.4 / uScale) * 0.3 * (1.0 - uGlobe * 0.6);
  }

  if (hit) {
    vec3 p = ro + rd * t;
    float hitPart = partId;
    float hitGlow = partGlow;
    vec3 n = normalAt(p);
    vec3 q0 = (p - vec3(uOffset, 0.0)) / uScale;
    vec3 q = q0;
    q.xz = rot(uTime * 0.15) * q.xz;

    float liftHeat = uLayers + uModules * (1.0 - uMorph * step(0.0, uProject));
    float partHeat = liftHeat * uPartLift * (1.0 - step(0.5, abs(hitPart - uPart))) * 1.4;
    partHeat += uModules * hitGlow * 1.2;
    col = lava(q, n, rd, partHeat);
    if (uGlobe > 0.01) col = mix(col, globe(q0, n, rd), uGlobe);
    col = mix(bg, col, cover);
  } else {
    col = bg;
  }

  col = mix(col, ink, uDim);
  gl_FragColor = vec4(pow(col, vec3(0.9)), 1.0);
}
`;
