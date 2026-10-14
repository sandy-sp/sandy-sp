export const VERTEX = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Raymarched signed-distance form. One field morphs between a lava sphere,
// orbiting agent nodes, a thread of nodes, and a ring. Mixing SDFs is not exact,
// so the march under-steps (0.7) to stay stable mid-morph.
export const FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // world units
uniform float uMouseOn;  // 0..1
uniform vec2 uOffset;    // world units
uniform float uScale;
uniform float uNodes;
uniform float uLine;
uniform float uRing;
uniform float uDim;
uniform float uHeat;
uniform float uFlow;

const float CAM_Z = 3.6;
const float FOCAL = 1.9;

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

float field(vec3 q, float amp) {
  return noise(q * 1.6 + vec3(0.0, uTime * 0.25, 0.0)) * 0.32 * amp
       + noise(q * 3.4 - uTime * 0.2) * 0.09 * amp;
}

float sdBlob(vec3 q, float amp) {
  return length(q) - (1.0 + field(q, amp));
}

float sdNodes(vec3 q) {
  float d = length(q) - 0.42 * (1.0 - uLine);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = fi * 1.2566 + uTime * 0.35;
    vec3 orbit = vec3(cos(a) * 1.35, sin(a * 2.0 + fi) * 0.28, sin(a) * 1.35);
    vec3 thread = vec3((fi - 2.0) * 0.95, sin(uTime * 0.6 + fi * 1.3) * 0.12, 0.0);
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

float map(vec3 p) {
  vec3 q = (p - vec3(uOffset, 0.0)) / uScale;
  float a = uTime * 0.15;
  q.xz = rot(a) * q.xz;

  // Pointer pulls the surface toward it.
  vec3 mp = vec3((uMouse - uOffset) / uScale, 0.9);
  float pull = exp(-dot(q - mp, q - mp) * 2.2) * 0.3 * uMouseOn;

  float amp = 1.0 + uFlow;
  float d = sdBlob(q, amp) - pull;
  if (uNodes > 0.001) d = mix(d, sdNodes(q) - pull * 0.5, uNodes);
  if (uRing > 0.001) d = mix(d, sdRing(q), uRing);
  return d * uScale;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)));
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

  bool hit = false;
  float t = 0.0;
  if (disc > 0.0) {
    t = max(-b - sqrt(disc), 0.0);
    float tMax = -b + sqrt(disc);
    for (int i = 0; i < 56; i++) {
      float h = map(ro + rd * t);
      if (h < 0.0015) { hit = true; break; }
      t += h * 0.75;
      if (t > tMax) break;
    }
  }

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    vec3 q = (p - vec3(uOffset, 0.0)) / uScale;
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.4);
    float dif = max(dot(n, normalize(vec3(-0.5, 0.8, 0.6))), 0.0);
    float core = noise(q * 2.2 + uTime * 0.3) * 0.5 + 0.5;

    vec3 oxblood = vec3(0.30, 0.05, 0.035);
    vec3 ember = vec3(0.95, 0.29, 0.16);
    vec3 hot = vec3(1.0, 0.72, 0.45);

    float heat = 0.35 + 0.65 * dif + uHeat * 0.35;
    col = mix(oxblood * 0.35, oxblood, dif);
    col = mix(col, ember, smoothstep(0.45 - uHeat * 0.15, 0.95, core) * heat);
    col += hot * pow(smoothstep(0.7 - uHeat * 0.1, 1.0, core), 3.0) * (0.6 + uHeat * 0.5);
    col += ember * fres * 0.9;
  } else {
    // Faint warm light around the form so it sits in the room rather than on it.
    float dist = length(uv - uOffset / (CAM_Z / FOCAL));
    col += vec3(0.22, 0.04, 0.03) * exp(-dist * 2.4 / uScale) * 0.3;
  }

  col = mix(col, ink, uDim);
  gl_FragColor = vec4(pow(col, vec3(0.9)), 1.0);
}
`;
