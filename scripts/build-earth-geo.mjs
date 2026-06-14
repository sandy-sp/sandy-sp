// Regenerates src/data/earth-geo.ts from raw GeoJSON sources.
// Usage: download ne_110m_land.geojson + india_state.geojson to /tmp, then: node scripts/build-earth-geo.mjs

import { readFileSync, writeFileSync } from "node:fs";

// --- Douglas-Peucker on [lon, lat] ---
function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t));
}

function dp(points, tol) {
  if (points.length <= 2) return points.slice();
  let maxD = -1, maxI = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > maxD) { maxD = d; maxI = i; }
  }
  if (maxD <= tol) return [points[0], points[points.length - 1]];
  const left = dp(points.slice(0, maxI + 1), tol);
  const right = dp(points.slice(maxI), tol);
  return left.slice(0, -1).concat(right);
}

function ringArea(ring) {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(area / 2);
}

function avgLat(ring) {
  return ring.reduce((s, p) => s + p[1], 0) / ring.length;
}

function ringBbox(ring) {
  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  for (const [lon, lat] of ring) {
    lonMin = Math.min(lonMin, lon);
    lonMax = Math.max(lonMax, lon);
    latMin = Math.min(latMin, lat);
    latMax = Math.max(latMax, lat);
  }
  return { lonMin, lonMax, latMin, latMax, cx: (lonMin + lonMax) / 2, cy: (latMin + latMax) / 2 };
}

// South Asian theater: tighten simplification here to crisp up coastlines/borders.
const SOUTH_ASIA = { lonMin: 60, lonMax: 100, latMin: 5, latMax: 38 };
const SOUTH_ASIA_TOL = 0.12;

function overlapsSouthAsia(bb) {
  return (
    bb.lonMax >= SOUTH_ASIA.lonMin &&
    bb.lonMin <= SOUTH_ASIA.lonMax &&
    bb.latMax >= SOUTH_ASIA.latMin &&
    bb.latMin <= SOUTH_ASIA.latMax
  );
}

// Explicit standalone-feature whitelist: small islands that must survive the area cull.
function isSriLanka(bb) {
  return bb.cx > 78 && bb.cx < 83 && bb.cy > 5 && bb.cy < 11;
}

function simplifyRing(ring, tol, decimals) {
  // ensure unclosed for DP, re-dedupe
  let pts = ring.slice();
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
    pts = pts.slice(0, -1);
  }
  const simplified = dp(pts.concat([pts[0]]), tol).slice(0, -1);
  const q = simplified.map(([lon, lat]) => [
    Number(lon.toFixed(decimals)),
    Number(lat.toFixed(decimals)),
  ]);
  const out = [];
  for (const p of q) {
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p);
  }
  return out;
}

// --- World land ---
const world = JSON.parse(readFileSync("/tmp/ne_land.json", "utf8"));
const worldFeatures = [];
let worldPts = 0;

let sriLankaRestored = false;

for (const f of world.features) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    const outer = poly[0];
    if (avgLat(outer) < -60) continue; // Antarctica
    const bb = ringBbox(outer);
    const area = ringArea(outer);
    const southAsia = overlapsSouthAsia(bb);
    const sriLanka = isSriLanka(bb);
    // Whitelisted standalone features bypass the small-island area cull.
    if (area < 12 && !sriLanka) continue;
    // High fidelity where it matters: tighter tolerance + extra decimal in South Asia.
    const tol = southAsia ? SOUTH_ASIA_TOL : 0.7;
    const decimals = southAsia ? 2 : 1;
    const rings = [];
    const o = simplifyRing(outer, tol, decimals);
    if (o.length < 4) continue;
    rings.push(o);
    for (let h = 1; h < poly.length; h++) {
      const hole = simplifyRing(poly[h], tol, decimals);
      if (hole.length >= 5 && ringArea(poly[h]) >= 12) rings.push(hole);
    }
    for (const r of rings) worldPts += r.length;
    const name = sriLanka ? "Sri Lanka" : "land";
    if (sriLanka) sriLankaRestored = true;
    worldFeatures.push({
      type: "Feature",
      properties: { name },
      geometry: { type: "Polygon", coordinates: rings },
    });
  }
}

if (!sriLankaRestored) throw new Error("Sri Lanka whitelist failed: feature not found in source");
console.log("Sri Lanka restored:", sriLankaRestored);

// --- India states ---
const india = JSON.parse(readFileSync("/tmp/india_states.json", "utf8"));
const skip = new Set([
  "Andaman and Nicobar", "Lakshadweep", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Puducherry", "Delhi",
]);
const rename = { Orissa: "Odisha", Uttaranchal: "Uttarakhand" };
const indiaFeatures = [];
let indiaPts = 0;

for (const f of india.features) {
  const rawName = f.properties.NAME_1;
  if (skip.has(rawName)) continue;
  const name = rename[rawName] ?? rawName;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  // largest outer ring only
  let best = null, bestArea = -1;
  for (const poly of polys) {
    const area = ringArea(poly[0]);
    if (area > bestArea) { bestArea = area; best = poly[0]; }
  }
  if (!best || bestArea < 0.15) continue;
  const ring = simplifyRing(best, 0.12, 2);
  if (ring.length < 4) continue;
  indiaPts += ring.length;
  indiaFeatures.push({
    type: "Feature",
    properties: { name },
    geometry: { type: "Polygon", coordinates: [ring] },
  });
}

console.log("world features:", worldFeatures.length, "pts:", worldPts);
console.log("india states:", indiaFeatures.length, "pts:", indiaPts);
for (const f of indiaFeatures) {
  console.log(" ", f.properties.name, f.geometry.coordinates[0].length);
}

const header = `// Auto-generated simplified GeoJSON dataset.
// Sources: Natural Earth 110m land (public domain), geohacker/india state boundaries.
// World: Douglas-Peucker tol 0.7° (0.12° within the South Asia theater), Antarctica + minor islands dropped.
// Sri Lanka is whitelisted past the small-island cull as a standalone feature.
// India: largest ring per state, tol 0.12°, 2-decimal quantization.

export type GeoFeature = {
  type: "Feature";
  properties: { name: string };
  geometry: { type: "Polygon"; coordinates: number[][][] };
};

export type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

`;

const body =
  `export const worldCoastlines: GeoFeatureCollection = ${JSON.stringify({ type: "FeatureCollection", features: worldFeatures })};\n\n` +
  `export const indiaStates: GeoFeatureCollection = ${JSON.stringify({ type: "FeatureCollection", features: indiaFeatures })};\n`;

writeFileSync(new URL("../src/data/earth-geo.ts", import.meta.url), header + body);
console.log("bytes:", (header + body).length);
