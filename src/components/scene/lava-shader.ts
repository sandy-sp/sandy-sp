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

float sdRing(vec3 q) {
  q.yz = rot(0.55) * q.yz;
  q.xy = rot(uTime * 0.08) * q.xy;
  vec2 t = vec2(length(q.xz) - 1.15, q.y);
  return length(t) - (0.17 + noise(q * 2.2 + uTime * 0.25) * 0.06);
}

// 3x3 grid of rounded modules, one per project. Active one slides forward.
float sdModules(vec3 q, out float id) {
  q.xz = rot(0.55 + sin(uTime * 0.25) * 0.25) * q.xz;
  q.yz = rot(-0.3) * q.yz;
  float d = 1e3;
  id = -1.0;
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    vec3 c = vec3(mod(fi, 3.0) - 1.0, 1.0 - floor(fi / 3.0), 0.0) * 0.68;
    float active = 1.0 - step(0.5, abs(fi - uPart));
    // Active module pops toward the viewer and grows; the rest shrink back.
    float lift = uPartLift * (uPart < 0.0 ? 0.0 : 1.0);
    c.z += active * lift * 0.6;
    c.xy *= 1.0 + active * lift * 0.12;
    c.y += sin(uTime * 0.8 + fi * 1.7) * 0.025;
    float size = 0.26 + active * lift * 0.07 - (1.0 - active) * lift * 0.03;
    float b = sdRoundBox(q - c, vec3(size), 0.07);
    if (b < d) { d = b; id = fi; }
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
    vec3 n = normalAt(p);
    vec3 q0 = (p - vec3(uOffset, 0.0)) / uScale;
    vec3 q = q0;
    q.xz = rot(uTime * 0.15) * q.xz;

    float partHeat = (uModules + uLayers) * uPartLift * (1.0 - step(0.5, abs(hitPart - uPart))) * 1.4;
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
