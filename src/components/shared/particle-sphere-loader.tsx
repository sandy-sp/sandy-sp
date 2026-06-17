"use client";

import { useEffect, useRef } from "react";

import { indiaStates, worldCoastlines } from "@/data/earth-geo";

type AnimationState =
  | "FORMING"
  | "HOME"
  | "MORPHING_TO_EARTH"
  | "EARTH_LOCK"
  | "ZOOMING_TO_INDIA"
  | "TIMELINE_LAYOUT"
  | "RETURNING_TO_HOME";

type MeshPoint = {
  x: number;
  y: number;
  z: number;
};

type MeshEdge = {
  a: number;
  b: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  radius: number;
  delayFrames: number;
  depth: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  scale: number;
  depth: number;
};

type DisplayPoint = ProjectedPoint & {
  opacity: number;
  radius: number;
};

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function normalizePoint(point: MeshPoint, radius = 1): MeshPoint {
  const length = Math.max(Math.hypot(point.x, point.y, point.z), 1e-6);

  return {
    x: (point.x / length) * radius,
    y: (point.y / length) * radius,
    z: (point.z / length) * radius,
  };
}

function interpolatePoint(a: MeshPoint, b: MeshPoint, t: number): MeshPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function crossProduct(a: MeshPoint, b: MeshPoint): MeshPoint {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dotProduct(a: MeshPoint, b: MeshPoint) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function subtractPoint(a: MeshPoint, b: MeshPoint): MeshPoint {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

function averagePoints(points: MeshPoint[]): MeshPoint {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      z: sum.z + point.z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
    z: total.z / points.length,
  };
}

function pointKey(point: MeshPoint, precision = 1000) {
  return `${Math.round(point.x * precision)}:${Math.round(point.y * precision)}:${Math.round(point.z * precision)}`;
}

const degToRad = Math.PI / 180;

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

type LatLon = readonly [number, number];

type RingBounds = {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
};

function ringBounds(ring: number[][]): RingBounds {
  let lonMin = Infinity;
  let lonMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;

  for (const [lon, lat] of ring) {
    lonMin = Math.min(lonMin, lon);
    lonMax = Math.max(lonMax, lon);
    latMin = Math.min(latMin, lat);
    latMax = Math.max(latMax, lat);
  }

  return { lonMin, lonMax, latMin, latMax };
}

function pointInRing(lon: number, lat: number, ring: number[][]) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

// GeoJSON-backed land shapes: outer ring + optional holes, bbox-pruned ray casting.
const worldLandShapes = worldCoastlines.features.map((feature) => ({
  rings: feature.geometry.coordinates,
  bounds: ringBounds(feature.geometry.coordinates[0]),
}));

// The 110m world coastline is coarse around the Indian shoreline; the state polygons
// are higher fidelity, so they also count as land for fill sampling.
const indiaStateShapes = indiaStates.features.map((feature) => ({
  ring: feature.geometry.coordinates[0],
  bounds: ringBounds(feature.geometry.coordinates[0]),
}));

function isLandLatLon(lat: number, lon: number) {
  for (const shape of worldLandShapes) {
    const { bounds } = shape;

    if (lon < bounds.lonMin || lon > bounds.lonMax || lat < bounds.latMin || lat > bounds.latMax) {
      continue;
    }

    if (!pointInRing(lon, lat, shape.rings[0])) {
      continue;
    }

    let insideHole = false;

    for (let ring = 1; ring < shape.rings.length; ring += 1) {
      if (pointInRing(lon, lat, shape.rings[ring])) {
        insideHole = true;
        break;
      }
    }

    if (!insideHole) {
      return true;
    }
  }

  for (const shape of indiaStateShapes) {
    const { bounds } = shape;

    if (lon < bounds.lonMin || lon > bounds.lonMax || lat < bounds.latMin || lat > bounds.latMax) {
      continue;
    }

    if (pointInRing(lon, lat, shape.ring)) {
      return true;
    }
  }

  return false;
}

// South Asia membership: strictly inside an Indian state polygon or the Sri Lanka
// coastline. Drives the zoom-phase alpha cull (everything else fades to 0).
const sriLankaShape = (() => {
  const feature = worldCoastlines.features.find((item) => item.properties.name === "Sri Lanka");

  if (!feature) {
    return null;
  }

  return { ring: feature.geometry.coordinates[0], bounds: ringBounds(feature.geometry.coordinates[0]) };
})();

function isSouthAsiaLatLon(lat: number, lon: number) {
  for (const shape of indiaStateShapes) {
    const { bounds } = shape;

    if (lon < bounds.lonMin || lon > bounds.lonMax || lat < bounds.latMin || lat > bounds.latMax) {
      continue;
    }

    if (pointInRing(lon, lat, shape.ring)) {
      return true;
    }
  }

  if (sriLankaShape) {
    const { bounds } = sriLankaShape;

    if (lon >= bounds.lonMin && lon <= bounds.lonMax && lat >= bounds.latMin && lat <= bounds.latMax && pointInRing(lon, lat, sriLankaShape.ring)) {
      return true;
    }
  }

  return false;
}

// Topographic ridge/plateau model: gaussian falloff around [lon, lat] polylines.
const elevationRidges: ReadonlyArray<{ path: ReadonlyArray<LatLon>; height: number; width: number }> = [
  { path: [[71, 36], [77, 35], [80, 31], [86, 28.5], [92, 28], [97, 28.5]], height: 1, width: 4 },
  { path: [[78, 33], [90, 33]], height: 0.75, width: 7 },
  { path: [[66, 35], [72, 36.5]], height: 0.8, width: 3.5 },
  { path: [[73.5, 20], [74.5, 15], [76.5, 10.5]], height: 0.35, width: 1.6 },
  { path: [[76, 17], [79, 15]], height: 0.25, width: 4 },
  { path: [[44, 38], [52, 30], [57, 27]], height: 0.5, width: 3 },
  { path: [[40, 43], [48, 42]], height: 0.55, width: 2 },
  { path: [[32, 39], [40, 39]], height: 0.4, width: 3 },
  { path: [[6, 45], [10, 46.5], [14, 46.5]], height: 0.5, width: 2.2 },
  { path: [[59, 51], [60, 60], [66, 67]], height: 0.3, width: 2.5 },
  { path: [[75, 42], [85, 47], [95, 50]], height: 0.6, width: 3.5 },
  { path: [[6, 59], [14, 65], [19, 69]], height: 0.35, width: 2.2 },
  { path: [[-77, 6], [-79, -2], [-76, -10], [-70, -18], [-70, -27], [-71, -35], [-73, -45], [-71, -52]], height: 0.8, width: 2.4 },
  { path: [[-150, 62], [-135, 58], [-127, 52], [-118, 45], [-110, 38], [-106, 32]], height: 0.6, width: 3.2 },
  { path: [[-84, 34], [-78, 39], [-72, 44]], height: 0.3, width: 2.2 },
  { path: [[-105, 28], [-99, 20]], height: 0.45, width: 2.5 },
  { path: [[-45, -22], [-42, -15]], height: 0.3, width: 4 },
  { path: [[36, 2], [34, -6], [33, -12]], height: 0.35, width: 2.5 },
  { path: [[37, 8], [39, 12]], height: 0.5, width: 3 },
  { path: [[-6, 31], [3, 35]], height: 0.4, width: 2 },
  { path: [[28, -30], [30, -28]], height: 0.35, width: 2 },
  { path: [[145, -17], [148, -25], [150, -32], [147, -37]], height: 0.35, width: 2 },
];

function segmentDistanceDeg(lon: number, lat: number, a: LatLon, b: LatLon) {
  const lonScale = Math.cos(clamp(lat, -80, 80) * degToRad);
  const ax = (lon - a[0]) * lonScale;
  const ay = lat - a[1];
  const bx = (b[0] - a[0]) * lonScale;
  const by = b[1] - a[1];
  const lengthSquared = bx * bx + by * by;
  const t = lengthSquared <= 1e-9 ? 0 : clamp((ax * bx + ay * by) / lengthSquared, 0, 1);
  const dx = ax - bx * t;
  const dy = ay - by * t;

  return Math.hypot(dx, dy);
}

function elevationAt(lat: number, lon: number) {
  let elevation = 0;

  for (const ridge of elevationRidges) {
    for (let i = 0; i < ridge.path.length - 1; i += 1) {
      const distance = segmentDistanceDeg(lon, lat, ridge.path[i], ridge.path[i + 1]);
      const contribution = ridge.height * Math.exp(-((distance / ridge.width) ** 2));

      if (contribution > elevation) {
        elevation = contribution;
      }
    }
  }

  const noiseSeed = Math.sin(lon * 12.9898 + lat * 78.233) * 43758.5453;
  elevation += (noiseSeed - Math.floor(noiseSeed)) * 0.07;

  return Math.min(elevation, 1.15);
}

// Screen convention: canvas y grows downward, so north latitudes map to negative mesh y.
function latLonToUnit(lat: number, lon: number): MeshPoint {
  const latRad = lat * degToRad;
  const lonRad = lon * degToRad;

  return {
    x: Math.cos(latRad) * Math.sin(lonRad),
    y: -Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad),
  };
}

type EarthPointKind = "land" | "ocean" | "border";

type EarthPoint = {
  ux: number;
  uy: number;
  uz: number;
  elevation: number;
  kind: EarthPointKind;
  size: number;
  spawnT: number;
  claimed: boolean;
  southAsia: boolean;
  // South-to-north ignition order for Indian state borders; -1 for everything else.
  stateRank: number;
};

type CoastPacket = {
  pathIndex: number;
  k: number;
  speed: number;
};

type StateGroup = {
  name: string;
  pointIndexes: number[];
  rank: number;
  centerLat: number;
};

type EarthData = {
  points: EarthPoint[];
  coastPaths: MeshPoint[][];
  packets: CoastPacket[];
  stateGroups: StateGroup[];
};

function makeEarthPoint(lat: number, lon: number, kind: Exclude<EarthPointKind, "border">): EarthPoint {
  const unit = latLonToUnit(lat, lon);
  const land = kind === "land";

  return {
    ux: unit.x,
    uy: unit.y,
    uz: unit.z,
    elevation: land ? elevationAt(lat, lon) : 0,
    kind,
    size: land ? 0.75 + Math.random() * 0.65 : 0.45 + Math.random() * 0.35,
    spawnT: 0.08 + Math.random() * 0.65,
    claimed: false,
    southAsia: isSouthAsiaLatLon(lat, lon),
    stateRank: -1,
  };
}

// Border vertices are fully deterministic: anchored spherical coordinates, no random
// size or phase, so structural outlines never jitter or relocate between sessions.
function makeBorderPoint(lat: number, lon: number, seed: number, southAsia: boolean): EarthPoint {
  const unit = latLonToUnit(lat, lon);

  return {
    ux: unit.x,
    uy: unit.y,
    uz: unit.z,
    elevation: elevationAt(lat, lon) * 0.5,
    kind: "border",
    size: 0.58 + (seed % 5) * 0.05,
    spawnT: 0.05 + (seed % 17) * 0.014,
    claimed: false,
    southAsia,
    stateRank: -1,
  };
}

// Walk a [lon, lat] ring with an even angular step; returns [lat, lon] samples.
function resampleRingLatLon(ring: number[][], stepDeg: number): Array<[number, number]> {
  const samples: Array<[number, number]> = [];

  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const lonScale = Math.cos(clamp((a[1] + b[1]) / 2, -80, 80) * degToRad);
    const segmentLength = Math.hypot((b[0] - a[0]) * lonScale, b[1] - a[1]);
    const steps = Math.max(1, Math.round(segmentLength / stepDeg));

    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      samples.push([a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t]);
    }
  }

  return samples;
}

function buildEarthData(): EarthData {
  const points: EarthPoint[] = [];
  const stateGroups: StateGroup[] = [];

  // Static structural border tracks: world coastlines from GeoJSON.
  let borderSeed = 0;

  for (const feature of worldCoastlines.features) {
    for (const ring of feature.geometry.coordinates) {
      for (const [lat, lon] of resampleRingLatLon(ring, 3)) {
        points.push(makeBorderPoint(lat, lon, borderSeed, isSouthAsiaLatLon(lat, lon)));
        borderSeed += 1;
      }
    }
  }

  // High-fidelity Indian state boundaries, grouped per state for targeted animation.
  for (const feature of indiaStates.features) {
    const group: StateGroup = { name: feature.properties.name, pointIndexes: [], rank: 0, centerLat: 0 };
    let latSum = 0;

    for (const [lat, lon] of resampleRingLatLon(feature.geometry.coordinates[0], 0.8)) {
      group.pointIndexes.push(points.length);
      points.push(makeBorderPoint(lat, lon, borderSeed, true));
      latSum += lat;
      borderSeed += 1;
    }

    group.centerLat = group.pointIndexes.length > 0 ? latSum / group.pointIndexes.length : 0;
    stateGroups.push(group);
  }

  // Rank states south-to-north so the boot-up illumination sweeps upward; tag member points.
  stateGroups
    .slice()
    .sort((a, b) => a.centerLat - b.centerLat)
    .forEach((group, rank) => {
      group.rank = rank;

      for (const pointIndex of group.pointIndexes) {
        points[pointIndex].stateRank = rank;
      }
    });

  // Interior landmass fill via rejection sampling.
  let landCount = 0;
  let attempts = 0;

  while (landCount < 500 && attempts < 60000) {
    attempts += 1;
    const lon = Math.random() * 360 - 180;
    const lat = Math.asin(Math.random() * 2 - 1) / degToRad;

    if (isLandLatLon(lat, lon)) {
      points.push(makeEarthPoint(lat, lon, "land"));
      landCount += 1;
    }
  }

  // Density boosts: tight one over the Indian subcontinent, broad one over Asia.
  const boostRegions: ReadonlyArray<readonly [number, number, number, number, number]> = [
    [68, 90, 6, 32, 90],
    [60, 145, -12, 58, 100],
  ];

  for (const [lonMin, lonMax, latMin, latMax, quota] of boostRegions) {
    let boostCount = 0;
    attempts = 0;

    while (boostCount < quota && attempts < 30000) {
      attempts += 1;
      const lon = lonMin + Math.random() * (lonMax - lonMin);
      const lat = latMin + Math.random() * (latMax - latMin);

      if (isLandLatLon(lat, lon)) {
        points.push(makeEarthPoint(lat, lon, "land"));
        boostCount += 1;
      }
    }
  }

  // Sparse ocean field from a fibonacci sphere for even organic coverage.
  const oceanSamples = 220;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < oceanSamples; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / oceanSamples;
    const lat = Math.asin(clamp(-y, -1, 1)) / degToRad;
    const lon = ((((i * goldenAngle) / degToRad) % 360) + 540) % 360 - 180;

    if (!isLandLatLon(lat, lon)) {
      points.push(makeEarthPoint(lat, lon, "ocean"));
    }
  }

  // Packet rails resampled from the world coastline rings — a separate kinetic layer
  // that never alters the anchored border vertices above.
  const coastPaths: MeshPoint[][] = [];

  for (const feature of worldCoastlines.features) {
    for (const ring of feature.geometry.coordinates) {
      const path = resampleRingLatLon(ring, 1.5).map(([lat, lon]) => latLonToUnit(lat, lon));

      if (path.length >= 12) {
        coastPaths.push(path);
      }
    }
  }

  const packets: CoastPacket[] = [];
  const maxPackets = 180;

  for (let pathIndex = 0; pathIndex < coastPaths.length && packets.length < maxPackets; pathIndex += 1) {
    const path = coastPaths[pathIndex];
    const count = Math.min(Math.max(3, Math.round(path.length * 0.14)), maxPackets - packets.length);

    for (let i = 0; i < count; i += 1) {
      packets.push({
        pathIndex,
        k: (path.length * i) / count + Math.random() * 3,
        speed: 0.1 + Math.random() * 0.16,
      });
    }
  }

  return { points, coastPaths, packets, stateGroups };
}

function buildHexSphereMesh(radius: number) {
  const subdivisions = 8;
  const phi = (1 + Math.sqrt(5)) / 2;
  const corners = [
    normalizePoint({ x: -1, y: phi, z: 0 }, radius),
    normalizePoint({ x: 1, y: phi, z: 0 }, radius),
    normalizePoint({ x: -1, y: -phi, z: 0 }, radius),
    normalizePoint({ x: 1, y: -phi, z: 0 }, radius),
    normalizePoint({ x: 0, y: -1, z: phi }, radius),
    normalizePoint({ x: 0, y: 1, z: phi }, radius),
    normalizePoint({ x: 0, y: -1, z: -phi }, radius),
    normalizePoint({ x: 0, y: 1, z: -phi }, radius),
    normalizePoint({ x: phi, y: 0, z: -1 }, radius),
    normalizePoint({ x: phi, y: 0, z: 1 }, radius),
    normalizePoint({ x: -phi, y: 0, z: -1 }, radius),
    normalizePoint({ x: -phi, y: 0, z: 1 }, radius),
  ];
  const baseFaces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ] as const;
  const points: MeshPoint[] = [];
  const pointIndexes = new Map<string, number>();
  const edgeKeys = new Set<string>();
  const edges: MeshEdge[] = [];
  const faces: number[][] = [];
  const pointFaces = new Map<number, number[]>();

  const addEdge = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;

    if (edgeKeys.has(key)) {
      return;
    }

    edgeKeys.add(key);
    edges.push({ a, b });
  };

  const getPointIndex = (point: MeshPoint) => {
    const normalized = normalizePoint(point, radius);
    const key = pointKey(normalized, 1800);
    const existing = pointIndexes.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const index = points.length;
    pointIndexes.set(key, index);
    points.push(normalized);
    return index;
  };

  for (const [aIndex, bIndex, cIndex] of baseFaces) {
    const a = corners[aIndex];
    const b = corners[bIndex];
    const c = corners[cIndex];
    const rows: number[][] = [];

    for (let row = 0; row <= subdivisions; row += 1) {
      const left = normalizePoint(interpolatePoint(a, b, row / subdivisions), radius);
      const right = normalizePoint(interpolatePoint(a, c, row / subdivisions), radius);
      const currentRow: number[] = [];

      for (let column = 0; column <= row; column += 1) {
        const point = row === 0
          ? a
          : normalizePoint(interpolatePoint(left, right, column / row), radius);
        currentRow.push(getPointIndex(point));
      }

      rows.push(currentRow);
    }

    for (let row = 1; row <= subdivisions; row += 1) {
      const prev = rows[row - 1];
      const curr = rows[row];

      for (let column = 0; column < row; column += 1) {
        faces.push([prev[column], curr[column], curr[column + 1]]);

        if (column > 0) {
          faces.push([prev[column - 1], prev[column], curr[column]]);
        }
      }
    }
  }

  const faceCentroids = faces.map((face) => normalizePoint(averagePoints(face.map((index) => points[index])), radius));

  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
    for (const pointIndex of faces[faceIndex]) {
      const attachedFaces = pointFaces.get(pointIndex) ?? [];
      attachedFaces.push(faceIndex);
      pointFaces.set(pointIndex, attachedFaces);
    }
  }

  for (const [pointIndex, attachedFaceIndexes] of pointFaces.entries()) {
    const center = points[pointIndex];
    const normal = normalizePoint(center);
    const fallbackUp = Math.abs(normal.y) > 0.92 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
    const tangent = normalizePoint(crossProduct(fallbackUp, normal));
    const bitangent = normalizePoint(crossProduct(normal, tangent));
    const boundaryIndexes = attachedFaceIndexes
      .map((faceIndex) => {
        const centroid = faceCentroids[faceIndex];
        const toCentroid = subtractPoint(centroid, center);
        const angle = Math.atan2(dotProduct(toCentroid, bitangent), dotProduct(toCentroid, tangent));

        return {
          angle,
          index: getPointIndex(centroid),
        };
      })
      .sort((left, right) => left.angle - right.angle)
      .map((item) => item.index);

    for (let edgeIndex = 0; edgeIndex < boundaryIndexes.length; edgeIndex += 1) {
      addEdge(boundaryIndexes[edgeIndex], boundaryIndexes[(edgeIndex + 1) % boundaryIndexes.length]);
    }
  }

  // Hex-cell centers carry no edges; compact to boundary vertices only for a continuous fine mesh.
  const usedIndexes = new Set<number>();

  for (const edge of edges) {
    usedIndexes.add(edge.a);
    usedIndexes.add(edge.b);
  }

  const indexRemap = new Map<number, number>();
  const compactPoints: MeshPoint[] = [];

  for (const index of usedIndexes) {
    indexRemap.set(index, compactPoints.length);
    compactPoints.push(points[index]);
  }

  const compactEdges = edges.map((edge) => ({
    a: indexRemap.get(edge.a) as number,
    b: indexRemap.get(edge.b) as number,
  }));

  return { points: compactPoints, edges: compactEdges, radius };
}

function projectPoint(
  point: MeshPoint,
  radius: number,
  centerX: number,
  centerY: number,
  yaw: number,
  tilt: number,
  zoomScale = 1,
  flatten = 0,
): ProjectedPoint {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosX = Math.cos(tilt);
  const sinX = Math.sin(tilt);
  const rotatedX = point.x * cosY + point.z * sinY;
  const rotatedZ = point.z * cosY - point.x * sinY;
  const rotatedY = point.y * cosX - rotatedZ * sinX;
  const finalZ = point.y * sinX + rotatedZ * cosX;
  // Flatten collapses perspective toward an orthographic plane (Z -> 0) for the 2.5D map.
  const projectedZ = finalZ * (1 - flatten);
  const focalLength = radius * 4.2;
  const scale = (focalLength / (focalLength - projectedZ)) * zoomScale;

  return {
    x: centerX + rotatedX * scale,
    y: centerY + rotatedY * scale,
    scale,
    depth: finalZ,
  };
}

type Vec4 = { x: number; y: number; z: number; w: number };

// A sphere dot either pins to one tesseract vertex (16 of them), or becomes a "free"
// dot bouncing inside the inner cube (normalized [-1,1] position + velocity).
type TessAssign =
  | { kind: "vertex"; v: number }
  | { kind: "inner"; px: number; py: number; pz: number; vx: number; vy: number; vz: number };

// Unit tesseract: 16 vertices (every ±1 combo), 32 edges (vertices that differ in
// exactly one coordinate). Built once and reused by the home-scroll morph.
function buildTesseract() {
  const vertices: Vec4[] = [];

  for (let i = 0; i < 16; i += 1) {
    vertices.push({
      x: i & 1 ? 1 : -1,
      y: i & 2 ? 1 : -1,
      z: i & 4 ? 1 : -1,
      w: i & 8 ? 1 : -1,
    });
  }

  const edges: MeshEdge[] = [];

  for (let a = 0; a < 16; a += 1) {
    for (let b = a + 1; b < 16; b += 1) {
      const diff = a ^ b;

      if ((diff & (diff - 1)) === 0) {
        edges.push({ a, b });
      }
    }
  }

  return { vertices, edges };
}

const tesseract = buildTesseract();

// Rotate a 4D vertex in the XW and YW planes (the "inside-out" hypercube motion),
// then perspective-project from 4D down to 3D. Z is left for the 3D yaw/tilt pass.
function projectTesseractVertex(v: Vec4, angleXW: number, angleYW: number): MeshPoint {
  let { x, y, w } = v;
  const { z } = v;

  const cxw = Math.cos(angleXW);
  const sxw = Math.sin(angleXW);
  const rx = x * cxw - w * sxw;
  const rw1 = x * sxw + w * cxw;
  x = rx;
  w = rw1;

  const cyw = Math.cos(angleYW);
  const syw = Math.sin(angleYW);
  const ry = y * cyw - w * syw;
  const rw2 = y * syw + w * cyw;
  y = ry;
  w = rw2;

  const dist = 2.4;
  const k = dist / (dist - w);

  return { x: x * k, y: y * k, z: z * k };
}

export function ParticleSphereLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mediaQuery.matches;

    const travelFrames = 150;
    const maxDelayFrames = 60;
    const transitionFrames = travelFrames + maxDelayFrames;
    const settleDelay = 800;
    const spinRampDuration = 2200;
    const resizeThreshold = 1;

    const spinUpFrames = 100;
    const cruiseFrames = 80;
    const earthBlendFrames = 90;
    const maxYawVelocity = 0.075;
    const minBrakeDistance = Math.PI * 2.5;
    const twoPi = Math.PI * 2;
    const indiaTargetYaw = -78.5 * degToRad;
    const indiaTargetTilt = -22 * degToRad;

    const zoomScaleMax = 3.5;
    const zoomCenterXFrom = 0.5;
    const zoomCenterXTo = 0.28;
    const zoomEaseRate = 0.12;
    const stateIgniteStaggerMs = 70;
    const stateIgniteRampMs = 220;
    const returnFrames = 64;

    let animationFrame = 0;
    let state: AnimationState = "HOME";
    let particles: Particle[] = [];
    let mesh = buildHexSphereMesh(Math.min(window.innerWidth, window.innerHeight) * 0.29);
    const startedAt = performance.now();
    let lastFrameAt = startedAt;
    let morphFrame = 0;
    let homeStartedAt = reducedMotion ? startedAt : 0;
    let spinAnnounced = false;
    let yaw = 0;
    let tilt = 0;
    let yawVelocity = 0;
    let startTilt = 0;
    let startYawVelocity = 0;
    let earthFrame = 0;
    let earthBlend = 0;
    let braking = false;
    let brakeDecel = 0;
    let brakeTargetYaw = 0;
    let lastHomeYaw = 0;
    let lastHomeYawVelocity = 0;
    let earthData: EarthData | null = null;
    let earthDataTimeout = 0;
    let earthAssignments: number[] = [];
    let meshUnits: MeshPoint[] = [];
    let zoomTarget = 0;
    let zoom = 0;
    let timelineStartedAt = 0;
    let desiredScene: "home" | "about" = "home";
    let aboutMorphTimer = 0;
    let aboutMorphScheduled = false;
    let homeScroll = 0;
    let homeScrollTarget = 0;
    // Mouse drives the hero sphere's rotation (it stays in place). Targets are normalized
    // [-1,1] from screen center; spinYaw/spinTilt ease toward them as rotation offsets.
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let spinYaw = 0;
    let spinTilt = 0;
    let tessAssignments: TessAssign[] = [];
    let netNodes: { hx: number; hy: number; vx: number; vy: number }[] = [];
    let socialTargets: ({ x: number; y: number } | null)[] = [];
    let socialW = 0;
    let socialH = 0;

    // Rasterize "SOCIAL" to an offscreen canvas and return the filled pixel positions
    // (screen space) the unlinked dots will fly to. Recomputed only on resize.
    const sampleSocialPoints = (w: number, h: number): { x: number; y: number }[] => {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");

      if (!octx) {
        return [];
      }

      octx.textBaseline = "top";
      octx.font = "800 100px Arial, sans-serif";
      const base = octx.measureText("SOCIAL").width || 1;
      const fontSize = Math.min((w * 0.92 * 100) / base, h * 0.32);
      octx.font = `800 ${fontSize}px Arial, sans-serif`;
      octx.fillStyle = "#fff";
      octx.fillText("SOCIAL", w * 0.03, h * 0.08);

      const data = octx.getImageData(0, 0, w, h).data;
      const gap = Math.max(3, Math.round(fontSize / 32));
      const pts: { x: number; y: number }[] = [];

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 128) {
            pts.push({ x, y });
          }
        }
      }

      for (let i = pts.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }

      return pts;
    };
    let returnFrame = 0;
    let returnStartZoom = 0;
    let returnStartBlend = 0;
    let returnStartYaw = 0;
    let returnStartTilt = 0;
    const elevationScale = 0.085;

    const setState = (next: AnimationState) => {
      state = next;
      window.dispatchEvent(new CustomEvent("sphere-state", { detail: { state: next } }));
    };

    const announceSpin = () => {
      spinAnnounced = true;
      // Global flag so overlays that mount after navigation (the canvas persists in the
      // layout) can reveal immediately instead of waiting for an event that already fired.
      (window as typeof window & { __sphereSpun?: boolean }).__sphereSpun = true;
      window.dispatchEvent(new CustomEvent("sphere-spin-start"));
    };

    const beginForming = () => {
      for (const particle of particles) {
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delayFrames = Math.random() * maxDelayFrames * 0.6 + particle.depth * maxDelayFrames * 0.4;
      }

      morphFrame = 0;
      setState("FORMING");
    };

    const enterHome = (now: number) => {
      homeStartedAt = now;
      setState("HOME");
      // Pre-build the earth point cloud while the sphere idles so the morph click is hitch-free.
      earthDataTimeout = window.setTimeout(() => {
        if (!earthData) {
          earthData = buildEarthData();
        }
      }, 350);
    };

    const lockEarth = () => {
      yawVelocity = 0;
      earthBlend = 1;
      setState("EARTH_LOCK");
      window.dispatchEvent(new CustomEvent("earth-rotation-locked"));
    };

    const assignEarthTargets = (data: EarthData) => {
      earthAssignments = particles.map((_, index) => {
        const unit = meshUnits[index];
        let bestIndex = 0;
        let bestDot = -2;

        for (let candidate = 0; candidate < data.points.length; candidate += 1) {
          const point = data.points[candidate];
          const dot = unit.x * point.ux + unit.y * point.uy + unit.z * point.uz;

          if (dot > bestDot) {
            bestDot = dot;
            bestIndex = candidate;
          }
        }

        data.points[bestIndex].claimed = true;
        return bestIndex;
      });
    };

    const beginEarthMorph = () => {
      if (state !== "HOME") {
        return;
      }

      if (!earthData) {
        earthData = buildEarthData();
      }

      // Clear prior claims so the cloud can be re-assigned on repeat visits.
      for (const point of earthData.points) {
        point.claimed = false;
      }

      assignEarthTargets(earthData);

      if (reducedMotion) {
        yaw = indiaTargetYaw;
        tilt = indiaTargetTilt;
        lockEarth();
        return;
      }

      yaw = lastHomeYaw;
      startTilt = lastHomeYaw * 0.42;
      tilt = startTilt;
      startYawVelocity = Math.max(lastHomeYawVelocity, 0.0005);
      yawVelocity = startYawVelocity;
      earthFrame = 0;
      earthBlend = 0;
      braking = false;
      setState("MORPHING_TO_EARTH");
    };

    // Route-driven scene control. The canvas persists across navigations, so pages
    // request a scene ("home" or "about") instead of mounting/unmounting the canvas.
    const requestAbout = () => {
      desiredScene = "about";

      if (aboutMorphScheduled || state !== "HOME") {
        return;
      }

      aboutMorphScheduled = true;
      window.clearTimeout(aboutMorphTimer);
      aboutMorphTimer = window.setTimeout(() => {
        aboutMorphScheduled = false;

        if (desiredScene === "about" && state === "HOME") {
          beginEarthMorph();
        }
      }, 900);
    };

    const snapHome = () => {
      zoom = 0;
      zoomTarget = 0;
      earthBlend = 0;
      earthFrame = 0;
      braking = false;
      yaw = 0;
      tilt = 0;
      yawVelocity = 0;
      homeStartedAt = performance.now();
      setState("HOME");
    };

    const resetToHome = () => {
      desiredScene = "home";
      aboutMorphScheduled = false;
      window.clearTimeout(aboutMorphTimer);

      // Already home (or still forming on first load) — nothing to reverse.
      if (state === "FORMING" || state === "HOME" || state === "RETURNING_TO_HOME") {
        return;
      }

      if (reducedMotion) {
        snapHome();
        return;
      }

      // Smoothly dissolve the Earth back into the abstract sphere: run the morph blend
      // backwards, zoom out, rotate to front, and fade the hex wireframe back in.
      zoomTarget = 0;
      braking = false;
      returnFrame = 0;
      returnStartZoom = zoom;
      returnStartBlend = earthBlend;
      returnStartYaw = yaw;
      returnStartTilt = tilt;
      setState("RETURNING_TO_HOME");
    };

    const beginBrake = () => {
      let distance = (((indiaTargetYaw - yaw) % twoPi) + twoPi) % twoPi;

      while (distance < minBrakeDistance) {
        distance += twoPi;
      }

      brakeDecel = (yawVelocity * yawVelocity) / (2 * distance);
      brakeTargetYaw = yaw + distance;
      braking = true;
    };

    // Populate the mesh-aligned unit vectors and the scattered particle pool. Runs
    // independently of the canvas-dimension check so a remount with an already-sized
    // canvas (e.g. React StrictMode's double-invoke) still seeds the particles.
    const ensureSeeded = (width: number, height: number) => {
      if (meshUnits.length === 0) {
        meshUnits = mesh.points.map((point) => normalizePoint(point));
      }

      if (particles.length === 0) {
        particles = mesh.points.map((point) => {
          const depth = Math.hypot(point.x, point.y) / mesh.radius;
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.35 + Math.random() * 0.95;
          const x = Math.random() * width;
          const y = Math.random() * height;

          return {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            startX: x,
            startY: y,
            radius: 0.6 + (1 - depth) * 0.65 + Math.random() * 0.4,
            delayFrames: 0,
            depth,
          };
        });
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nextCanvasWidth = Math.floor(width * ratio);
      const nextCanvasHeight = Math.floor(height * ratio);
      const dimsMatch =
        Math.abs(canvas.width - nextCanvasWidth) <= resizeThreshold &&
        Math.abs(canvas.height - nextCanvasHeight) <= resizeThreshold;

      if (!dimsMatch) {
        canvas.width = nextCanvasWidth;
        canvas.height = nextCanvasHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        mesh = buildHexSphereMesh(Math.min(width, height) * 0.29);
        meshUnits = mesh.points.map((point) => normalizePoint(point));

        for (const particle of particles) {
          particle.x = clamp(particle.x, particle.radius, width - particle.radius);
          particle.y = clamp(particle.y, particle.radius, height - particle.radius);
          particle.startX = clamp(particle.startX, particle.radius, width - particle.radius);
          particle.startY = clamp(particle.startY, particle.radius, height - particle.radius);
        }
      } else {
        // Canvas kept its size (transform may have been reset on remount); restore it.
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      ensureSeeded(width, height);
    };

    const drawSphere = (now: number, width: number, height: number, dtFactor: number, darkMode: boolean) => {
      const spinElapsed = state === "HOME" ? Math.max(0, now - homeStartedAt - settleDelay) : 0;
      const spinRamp = clamp(spinElapsed / spinRampDuration, 0, 1);
      const baseYaw = reducedMotion ? 0 : spinElapsed * 0.00012 * spinRamp;
      const baseTilt = baseYaw * 0.42;
      const spinVelocityPerMs = spinRamp >= 1 ? 0.00012 : (2 * spinElapsed * 0.00012) / spinRampDuration;
      // Base (auto-spin) drives the morph hand-off; mouse spin is a hero-only extra offset.
      lastHomeYaw = baseYaw;
      lastHomeYawVelocity = reducedMotion ? 0 : spinVelocityPerMs * 16.667;
      const heroFactor = clamp(1 - homeScroll / 0.32, 0, 1);
      const renderYaw = baseYaw + spinYaw * heroFactor;
      const renderTilt = baseTilt + spinTilt * heroFactor;

      const formed = state !== "FORMING";
      const overallMorph = formed || reducedMotion ? 1 : clamp(morphFrame / transitionFrames, 0, 1);
      const lineProgress = reducedMotion ? 1 : easeOutCubic(smoothstep(0.42, 1, overallMorph));
      const dotBase = darkMode ? "214, 92, 92" : "153, 51, 51";
      const lineBase = "118, 118, 118";
      const dotGlow = darkMode ? "236, 121, 121" : "153, 51, 51";
      // Three scroll phases: P 0->0.32 sphere -> tesseract; 0.32->0.62 tesseract -> drifting
      // particle network; 0.66->1 the unlinked dots peel off to spell SOCIAL.
      const P = clamp(homeScroll, 0, 1);
      const ph1 = clamp(P / 0.32, 0, 1);
      const ph2 = clamp((P - 0.32) / 0.3, 0, 1);
      const ph3 = clamp((P - 0.66) / 0.34, 0, 1);
      const settle = smoothstep(0.6, 1.0, ph1);
      const morph = mix(0.5 * smoothstep(0.0, 0.3, ph1), 1.0, settle);
      const leftShift = smoothstep(0.05, 0.9, ph1);
      // On narrow screens keep the object centered (text panels stack as cards instead of
      // sitting to the right); on wider screens slide it left for the split layout.
      const leftEnd = width < 760 ? 0.5 : 0.28;
      const homeCenterX = mix(width / 2, width * leftEnd, leftShift);
      const centerY = height / 2;
      const tessActive = ph1 > 0.001;
      const tessScale = mesh.radius * 0.46;
      const angleXW = reducedMotion ? 0.6 : now * 0.00025;
      const angleYW = reducedMotion ? 0.3 : now * 0.00017;
      // Live 3D positions of the rotating tesseract's 16 vertices (4D-rotated, projected to 3D).
      const tessVerts3D = tesseract.vertices.map((v) => {
        const p = projectTesseractVertex(v, angleXW, angleYW);
        return { x: p.x * tessScale, y: p.y * tessScale, z: p.z * tessScale };
      });

      // First 16 dots pin one-per-vertex; every other dot bounces inside the inner cube.
      if (tessActive && tessAssignments.length !== particles.length) {
        const rand = () => Math.random() * 2 - 1;
        tessAssignments = particles.map((_, i) => {
          if (i < tesseract.vertices.length) {
            return { kind: "vertex", v: i };
          }

          const speed = 0.013;
          return {
            kind: "inner",
            px: rand(),
            py: rand(),
            pz: rand(),
            vx: rand() * speed,
            vy: rand() * speed,
            vz: rand() * speed,
          };
        });
      }

      // Bounce volume sits inside the inner cube. Each dot's 3D position is lerped from
      // its sphere spot to its target (a pinned vertex, or a live bouncing spot).
      const innerHalf = tessScale * 0.62;
      const projected = mesh.points.map((point, index) => {
        if (!tessActive) {
          return projectPoint(point, mesh.radius, homeCenterX, centerY, renderYaw, renderTilt);
        }

        const asn = tessAssignments[index];
        let tx: number;
        let ty: number;
        let tz: number;

        if (asn.kind === "vertex") {
          const v = tessVerts3D[asn.v];
          tx = v.x;
          ty = v.y;
          tz = v.z;
        } else {
          // Advance and bounce off the cube walls (normalized space), then scale in.
          asn.px += asn.vx * dtFactor;
          asn.py += asn.vy * dtFactor;
          asn.pz += asn.vz * dtFactor;
          if (asn.px > 1 || asn.px < -1) { asn.px = clamp(asn.px, -1, 1); asn.vx = -asn.vx; }
          if (asn.py > 1 || asn.py < -1) { asn.py = clamp(asn.py, -1, 1); asn.vy = -asn.vy; }
          if (asn.pz > 1 || asn.pz < -1) { asn.pz = clamp(asn.pz, -1, 1); asn.vz = -asn.vz; }
          tx = asn.px * innerHalf;
          ty = asn.py * innerHalf;
          tz = asn.pz * innerHalf;
        }

        return projectPoint(
          {
            x: mix(point.x, tx, morph),
            y: mix(point.y, ty, morph),
            z: mix(point.z, tz, morph),
          },
          mesh.radius,
          homeCenterX,
          centerY,
          renderYaw,
          renderTilt,
        );
      });

      // Sphere wireframe dissolves early; tesseract wireframe ghosts in before the dots
      // finish settling, so the frame is already there to receive them (no line pop).
      const sphereLineFade = clamp(1 - smoothstep(0.0, 0.4, ph1), 0, 1);
      const tessLineFade = smoothstep(0.5, 1.0, ph1);

      context.save();
      context.globalCompositeOperation = "source-over";
      context.lineCap = "round";

      // Phase 2 — the formed tesseract breaks down into a drifting particle network: each
      // dot flows from its tesseract spot out to a screen-space node that drifts and links
      // up with its neighbours (the particle-background look, rebuilt from these dots).
      if (ph2 > 0.001) {
        const ph2e = easeInOutCubic(ph2);
        const ph3e = easeInOutCubic(ph3);
        // Linked dots (every `step`th) stay as the drifting network; the rest are free to
        // peel off and form SOCIAL in phase 3.
        const step = Math.max(1, Math.floor(particles.length / 130));

        if (netNodes.length !== particles.length) {
          netNodes = particles.map(() => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.16 + Math.random() * 0.3;
            return {
              hx: Math.random() * width,
              hy: Math.random() * height,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
            };
          });
        }

        // Assign each unlinked dot a glyph pixel of SOCIAL (rebuilt on resize).
        if (socialTargets.length !== particles.length || socialW !== width || socialH !== height) {
          const pts = sampleSocialPoints(width, height);
          let k = 0;
          socialTargets = particles.map((_, i) => {
            if (i % step === 0 || pts.length === 0) {
              return null;
            }
            const point = pts[k % pts.length];
            k += 1;
            return point;
          });
          socialW = width;
          socialH = height;
        }

        // Tesseract wireframe fades out as the network forms.
        const wf = (1 - ph2) * smoothstep(0.5, 1.0, ph1);
        if (wf > 0.01) {
          const tessProj = tessVerts3D.map((pt) =>
            projectPoint(pt, mesh.radius, homeCenterX, centerY, renderYaw, renderTilt),
          );
          for (const edge of tesseract.edges) {
            const a = tessProj[edge.a];
            const b = tessProj[edge.b];
            const vis = smoothstep(-0.7, 0.7, (a.depth + b.depth) / (mesh.radius * 2));
            context.strokeStyle = `rgba(${lineBase}, ${(darkMode ? 0.42 : 0.34) * (0.4 + 0.6 * vis) * wf})`;
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }

        // Blend each dot: tesseract -> network node; unlinked dots then -> SOCIAL glyph.
        const pts: { x: number; y: number; linked: boolean }[] = [];
        for (let i = 0; i < particles.length; i += 1) {
          const node = netNodes[i];
          if (!reducedMotion) {
            node.hx += node.vx * dtFactor;
            node.hy += node.vy * dtFactor;
            if (node.hx < 0 || node.hx > width) {
              node.vx = -node.vx;
              node.hx = clamp(node.hx, 0, width);
            }
            if (node.hy < 0 || node.hy > height) {
              node.vy = -node.vy;
              node.hy = clamp(node.hy, 0, height);
            }
          }
          const tp = projected[i];
          let x = mix(tp.x, node.hx, ph2e);
          let y = mix(tp.y, node.hy, ph2e);
          const linked = i % step === 0;
          const target = socialTargets[i];

          if (!linked && ph3 > 0 && target) {
            x = mix(x, target.x, ph3e);
            y = mix(y, target.y, ph3e);
          }

          pts.push({ x, y, linked });
        }

        // Link lines among the linked subset only; opacity drops as SOCIAL forms.
        const link = Math.min(150, Math.max(95, width * 0.11));
        const lineFade = ph2 * (1 - 0.6 * ph3);
        context.lineWidth = 1;
        for (let i = 0; i < pts.length; i += step) {
          for (let j = i + step; j < pts.length; j += step) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d = Math.hypot(dx, dy);
            if (d < link) {
              const op = (0.12 + (1 - d / link) * 0.42) * lineFade;
              context.strokeStyle = `rgba(${lineBase}, ${op})`;
              context.beginPath();
              context.moveTo(pts[i].x, pts[i].y);
              context.lineTo(pts[j].x, pts[j].y);
              context.stroke();
            }
          }
        }

        // Dots. SOCIAL glyph dots read a touch brighter as they settle.
        for (let i = 0; i < pts.length; i += 1) {
          const glyph = !pts[i].linked && ph3 > 0.01;
          context.fillStyle = `rgba(${dotBase}, ${glyph ? 0.6 + 0.35 * ph3 : 0.8})`;
          context.beginPath();
          context.arc(pts[i].x, pts[i].y, glyph ? 1.2 + 0.5 * ph3 : 1.3, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
        return;
      }

      const particleOrder = particles
        .map((particle, index) => ({ index, particle, target: projected[index] }))
        .sort((left, right) => left.target.depth - right.target.depth);
      const displayPoints: DisplayPoint[] = [];

      for (const item of particleOrder) {
        const { index, particle, target } = item;
        const progress = formed || reducedMotion
          ? 1
          : clamp((morphFrame - particle.delayFrames) / travelFrames, 0, 1);
        const eased = easeOutCubic(progress);
        const drift = formed ? Math.sin(now * 0.0015 + index) * 0.75 : 0;
        const depthVisibility = smoothstep(-mesh.radius * 0.38, mesh.radius * 0.12, target.depth);

        particle.x = particle.startX + (target.x - particle.startX) * eased;
        particle.y = particle.startY + (target.y - particle.startY) * eased;

        const glow = (0.14 + eased * 0.56) * (0.35 + depthVisibility * 0.65);
        const dotRadius = (particle.radius + (target.scale - 1) * 1.6) * (0.62 + eased * 0.38);

        displayPoints[index] = {
          ...target,
          x: particle.x + drift,
          y: particle.y - drift,
          opacity: eased * depthVisibility,
          radius: dotRadius * (0.82 + depthVisibility * 0.18),
        };

        if (depthVisibility > 0.55) {
          context.shadowColor = `rgba(${dotGlow}, ${0.14 + glow * 0.34})`;
          context.shadowBlur = (2 + eased * 5) * depthVisibility;
        } else {
          context.shadowBlur = 0;
        }

        context.fillStyle = `rgba(${dotBase}, ${0.14 + eased * (darkMode ? 0.8 : 0.72) * depthVisibility})`;
        context.beginPath();
        context.arc(displayPoints[index].x, displayPoints[index].y, dotRadius, 0, Math.PI * 2);
        context.fill();
      }

      const sortedEdges = [...mesh.edges].sort((left, right) => {
        const leftDepth = projected[left.a].depth + projected[left.b].depth;
        const rightDepth = projected[right.a].depth + projected[right.b].depth;

        return leftDepth - rightDepth;
      });

      context.shadowBlur = 0;

      for (const edge of sortedEdges) {
        const a = displayPoints[edge.a];
        const b = displayPoints[edge.b];

        if (!a || !b) {
          continue;
        }

        const lineDepth = (a.depth + b.depth) / (mesh.radius * 2);
        const arrivalProgress = Math.min(a.opacity, b.opacity);
        const depthVisibility = smoothstep(-0.16, 0.18, lineDepth);
        const mergeProgress = lineProgress * smoothstep(0.34, 0.95, arrivalProgress);
        const opacity =
          ((darkMode ? 0.14 : 0.12) * mergeProgress +
            clamp(lineDepth + 0.24, 0, darkMode ? 0.36 : 0.28) * mergeProgress * depthVisibility) *
          sphereLineFade;

        if (opacity <= 0.01) {
          continue;
        }

        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const startX = mix(midX, a.x, mergeProgress);
        const startY = mix(midY, a.y, mergeProgress);
        const endX = mix(midX, b.x, mergeProgress);
        const endY = mix(midY, b.y, mergeProgress);

        context.strokeStyle = `rgba(${lineBase}, ${opacity})`;
        context.lineWidth = (darkMode ? 0.56 : 0.5) + ((a.scale + b.scale) / 2 - 1) * (darkMode ? 0.9 : 0.82);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      }

      // Tesseract wireframe fades in to frame the dots that have flown onto its edges.
      if (tessLineFade > 0.01) {
        const tessProj = tessVerts3D.map((p) =>
          projectPoint(p, mesh.radius, homeCenterX, centerY, renderYaw, renderTilt),
        );
        const tessEdges = [...tesseract.edges].sort(
          (l, r) => tessProj[l.a].depth + tessProj[l.b].depth - (tessProj[r.a].depth + tessProj[r.b].depth),
        );

        for (const edge of tessEdges) {
          const a = tessProj[edge.a];
          const b = tessProj[edge.b];
          const depthN = (a.depth + b.depth) / (mesh.radius * 2);
          const vis = smoothstep(-0.7, 0.7, depthN);
          const opacity = (darkMode ? 0.42 : 0.34) * (0.4 + 0.6 * vis) * tessLineFade;

          context.strokeStyle = `rgba(${lineBase}, ${opacity})`;
          context.lineWidth = (darkMode ? 0.62 : 0.55) + vis * 0.5;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      context.restore();
    };

    const drawEarth = (now: number, width: number, height: number, dtFactor: number, darkMode: boolean) => {
      if (!earthData) {
        return;
      }

      const eased = easeInOutCubic(earthBlend);
      const returning = state === "RETURNING_TO_HOME";
      // Forward morph dissolves the wireframe out; the return transition fades it back in
      // as the Earth blend unwinds, so the handoff to the HOME sphere has no line pop.
      const edgeFade = returning ? clamp(1 - earthBlend, 0, 1) : reducedMotion ? 0 : clamp(1 - earthFrame / 28, 0, 1);
      // Scroll-bound topographic zoom: magnify, shift the center left, flatten to 2.5D,
      // and cull everything outside the South Asia polygons.
      const zoomEased = easeInOutCubic(clamp(zoom, 0, 1));
      const centerX = mix(width * zoomCenterXFrom, width * zoomCenterXTo, zoomEased);
      const centerY = height / 2;
      const zoomScale = mix(1, zoomScaleMax, zoomEased);
      const flatten = zoomEased;
      const cull = smoothstep(0.08, 0.62, zoom);
      const landRgb = darkMode ? [255, 141, 123] : [186, 32, 32];
      const oceanRgb = [118, 118, 118];
      const dotRgb = darkMode ? [214, 92, 92] : [153, 51, 51];
      const packetColor = darkMode ? "255, 176, 154" : "196, 44, 38";
      const glowColor = darkMode ? "236, 121, 121" : "153, 51, 51";

      context.save();
      context.lineCap = "round";
      context.shadowBlur = 0;

      const displayPoints: DisplayPoint[] = [];

      // Per-point alpha after the zoom cull: South Asia stays lit, the rest fades out.
      const cullAlpha = (point: EarthPoint) => (point.southAsia ? 1 : 1 - cull);

      // State-border ignition: south-to-north micro-staggered illumination once the
      // timeline layout boots up. Returns an alpha multiplier and a neon pulse [0..1].
      const igniteFor = (point: EarthPoint) => {
        if (state !== "TIMELINE_LAYOUT" || point.stateRank < 0) {
          return { alpha: 1, glow: 0 };
        }

        const local = now - timelineStartedAt - point.stateRank * stateIgniteStaggerMs;

        if (local <= 0) {
          return { alpha: 0.78, glow: 0 };
        }

        const ramp = smoothstep(0, stateIgniteRampMs, local);
        const pulse = Math.exp(-(((local - stateIgniteRampMs * 0.85) / (stateIgniteRampMs * 0.7)) ** 2));

        return { alpha: 0.78 + ramp * 0.5, glow: pulse };
      };

      // Theme-aware style per point kind. Borders read brighter and crisper than the
      // soft interior fill; the ocean stays a faint background field.
      const styleFor = (point: EarthPoint, depthVisibility: number) => {
        if (point.kind === "border") {
          return {
            rgb: landRgb,
            alpha: 0.32 + 0.58 * depthVisibility + point.elevation * 0.1,
            size: point.size,
          };
        }

        if (point.kind === "land") {
          return {
            rgb: landRgb,
            alpha: 0.18 + 0.42 * depthVisibility + point.elevation * 0.22,
            size: point.size * (0.85 + point.elevation * 0.55),
          };
        }

        return {
          rgb: oceanRgb,
          alpha: (darkMode ? 0.18 : 0.14) * (0.35 + 0.65 * depthVisibility),
          size: point.size * 0.8,
        };
      };

      // Hex-mesh particles, freed from the wireframe, travel to their claimed cloud targets.
      for (let index = 0; index < particles.length; index += 1) {
        const unit = meshUnits[index];
        const targetPoint = earthData.points[earthAssignments[index]];
        const mixedX = mix(unit.x, targetPoint.ux, eased);
        const mixedY = mix(unit.y, targetPoint.uy, eased);
        const mixedZ = mix(unit.z, targetPoint.uz, eased);
        const length = Math.max(Math.hypot(mixedX, mixedY, mixedZ), 1e-6);
        const modelRadius = (mesh.radius * (1 + targetPoint.elevation * elevationScale * eased)) / length;
        const projectedPoint = projectPoint(
          { x: mixedX * modelRadius, y: mixedY * modelRadius, z: mixedZ * modelRadius },
          mesh.radius,
          centerX,
          centerY,
          yaw,
          tilt,
          zoomScale,
          flatten,
        );
        const depthVisibility = smoothstep(-mesh.radius * 0.38, mesh.radius * 0.12, projectedPoint.depth);
        const targetStyle = styleFor(targetPoint, depthVisibility);
        const ignite = igniteFor(targetPoint);
        const baseAlpha = 0.14 + (darkMode ? 0.8 : 0.72) * depthVisibility;
        const alpha = clamp(mix(baseAlpha, targetStyle.alpha, eased) * cullAlpha(targetPoint) * ignite.alpha, 0, 1);

        if (alpha <= 0.005) {
          continue;
        }

        const size = mix(particles[index].radius, targetStyle.size, eased) * (1 + (projectedPoint.scale - 1) * 0.8) * (1 + ignite.glow * 0.4);
        const colorR = Math.round(mix(dotRgb[0], targetStyle.rgb[0], eased));
        const colorG = Math.round(mix(dotRgb[1], targetStyle.rgb[1], eased));
        const colorB = Math.round(mix(dotRgb[2], targetStyle.rgb[2], eased));

        if (edgeFade > 0.01) {
          displayPoints[index] = { ...projectedPoint, opacity: depthVisibility, radius: size };
        }

        if (ignite.glow > 0.04) {
          context.shadowColor = `rgba(${glowColor}, ${0.2 + ignite.glow * 0.6})`;
          context.shadowBlur = 4 + ignite.glow * 9;
        } else if (targetPoint.kind !== "ocean" && depthVisibility > 0.6 && eased > 0.5) {
          context.shadowColor = `rgba(${glowColor}, ${0.3 * eased})`;
          context.shadowBlur = (2 + targetPoint.elevation * 4) * depthVisibility;
        } else {
          context.shadowBlur = 0;
        }

        context.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${alpha})`;
        context.beginPath();
        context.arc(projectedPoint.x, projectedPoint.y, size, 0, Math.PI * 2);
        context.fill();
      }

      // Wireframe connections dissolve completely at the start of the morph.
      if (edgeFade > 0.01) {
        context.shadowBlur = 0;
        context.lineWidth = darkMode ? 0.56 : 0.5;

        for (const edge of mesh.edges) {
          const a = displayPoints[edge.a];
          const b = displayPoints[edge.b];

          if (!a || !b) {
            continue;
          }

          const lineDepth = (a.depth + b.depth) / (mesh.radius * 2);
          const opacity = (darkMode ? 0.3 : 0.24) * edgeFade * smoothstep(-0.16, 0.18, lineDepth);

          if (opacity <= 0.01) {
            continue;
          }

          context.strokeStyle = `rgba(118, 118, 118, ${opacity})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      // Unclaimed micro-particles materialize with a staggered spawn window.
      context.shadowBlur = 0;

      for (const point of earthData.points) {
        if (point.claimed) {
          continue;
        }

        const spawn = smoothstep(point.spawnT, point.spawnT + 0.22, earthBlend);

        if (spawn <= 0.01) {
          continue;
        }

        // Borders skip the radial grow-in: they stay anchored at their exact spherical
        // coordinate from the first visible frame and only fade in.
        const growIn = point.kind === "border" ? 1 : 0.96 + 0.04 * spawn;
        const modelRadius = mesh.radius * growIn * (1 + point.elevation * elevationScale * spawn);
        const projectedPoint = projectPoint(
          { x: point.ux * modelRadius, y: point.uy * modelRadius, z: point.uz * modelRadius },
          mesh.radius,
          centerX,
          centerY,
          yaw,
          tilt,
          zoomScale,
          flatten,
        );
        const depthVisibility = smoothstep(-mesh.radius * 0.38, mesh.radius * 0.12, projectedPoint.depth);

        if (depthVisibility <= 0.02) {
          continue;
        }

        const style = styleFor(point, depthVisibility);
        const ignite = igniteFor(point);
        const alpha = clamp(spawn * style.alpha * cullAlpha(point) * ignite.alpha, 0, 1);

        if (alpha <= 0.005) {
          continue;
        }

        const size = style.size * (1 + (projectedPoint.scale - 1) * 0.8) * (1 + ignite.glow * 0.4);

        if (ignite.glow > 0.04) {
          context.shadowColor = `rgba(${glowColor}, ${0.2 + ignite.glow * 0.6})`;
          context.shadowBlur = 4 + ignite.glow * 9;
        } else {
          context.shadowBlur = 0;
        }

        context.fillStyle = `rgba(${style.rgb[0]}, ${style.rgb[1]}, ${style.rgb[2]}, ${alpha})`;
        context.beginPath();
        context.arc(projectedPoint.x, projectedPoint.y, size, 0, Math.PI * 2);
        context.fill();
      }

      // Kinetic data packets streaming along the coastline vectors. They retire as the
      // globe flattens into the architectural map so the topography reads cleanly.
      const packetGate = smoothstep(0.55, 0.92, earthBlend) * (1 - smoothstep(0.05, 0.4, zoom));

      if (packetGate > 0.01) {
        for (const packet of earthData.packets) {
          const path = earthData.coastPaths[packet.pathIndex];

          if (!reducedMotion) {
            packet.k += packet.speed * dtFactor;
          }

          for (let trail = 0; trail < 3; trail += 1) {
            const wrapped = (((packet.k - trail * 1.7) % path.length) + path.length) % path.length;
            const i0 = Math.floor(wrapped);
            const i1 = (i0 + 1) % path.length;
            const t = wrapped - i0;
            const mixedX = mix(path[i0].x, path[i1].x, t);
            const mixedY = mix(path[i0].y, path[i1].y, t);
            const mixedZ = mix(path[i0].z, path[i1].z, t);
            const length = Math.max(Math.hypot(mixedX, mixedY, mixedZ), 1e-6);
            // Packets glide just above the static border tracks as a separate accent layer.
            const modelRadius = (mesh.radius * 1.01) / length;
            const projectedPoint = projectPoint(
              { x: mixedX * modelRadius, y: mixedY * modelRadius, z: mixedZ * modelRadius },
              mesh.radius,
              centerX,
              centerY,
              yaw,
              tilt,
              zoomScale,
              flatten,
            );
            const depthVisibility = smoothstep(-mesh.radius * 0.38, mesh.radius * 0.12, projectedPoint.depth);

            if (depthVisibility <= 0.03) {
              continue;
            }

            const alpha = packetGate * (1 - trail * 0.32) * (0.2 + 0.8 * depthVisibility);
            const size = (1.7 - trail * 0.45) * (1 + (projectedPoint.scale - 1) * 0.8);

            if (trail === 0 && depthVisibility > 0.6) {
              context.shadowColor = `rgba(${packetColor}, 0.5)`;
              context.shadowBlur = 6 * depthVisibility;
            } else {
              context.shadowBlur = 0;
            }

            context.fillStyle = `rgba(${packetColor}, ${alpha})`;
            context.beginPath();
            context.arc(projectedPoint.x, projectedPoint.y, size, 0, Math.PI * 2);
            context.fill();
          }
        }
      }

      context.restore();
    };

    const draw = (now: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dtFactor = clamp(now - lastFrameAt, 0, 48) / 16.667;
      lastFrameAt = now;
      const darkMode = document.documentElement.dataset.theme === "dark";

      // Ease the sphere's mouse-driven spin offset (rotates toward the cursor).
      if (reducedMotion) {
        spinYaw = 0;
        spinTilt = 0;
      } else {
        const k = clamp(0.05 * dtFactor, 0, 1);
        spinYaw += (pointerTargetX * 0.45 - spinYaw) * k;
        spinTilt += (pointerTargetY * 0.3 - spinTilt) * k;
      }

      // Ease the scroll-driven home morph toward its target while idling on the sphere.
      if (state === "HOME") {
        if (reducedMotion) {
          homeScroll = homeScrollTarget;
        } else {
          homeScroll += (homeScrollTarget - homeScroll) * clamp(0.26 * dtFactor, 0, 1);

          if (Math.abs(homeScrollTarget - homeScroll) < 0.001) {
            homeScroll = homeScrollTarget;
          }
        }
      }

      if (state === "FORMING") {
        morphFrame += 1;

        if (morphFrame >= transitionFrames) {
          enterHome(now);
        }
      } else if (state === "MORPHING_TO_EARTH") {
        earthFrame += dtFactor;
        earthBlend = smoothstep(0, earthBlendFrames, earthFrame);
        tilt = mix(startTilt, indiaTargetTilt, easeOutCubic(clamp(earthFrame / spinUpFrames, 0, 1)));

        if (!braking) {
          const rampProgress = clamp(earthFrame / spinUpFrames, 0, 1);
          yawVelocity = mix(startYawVelocity, maxYawVelocity, rampProgress * rampProgress);
          yaw += yawVelocity * dtFactor;

          if (earthFrame >= spinUpFrames + cruiseFrames) {
            beginBrake();
          }
        } else {
          const remaining = brakeTargetYaw - yaw;

          if (remaining <= 0.0006) {
            yaw = brakeTargetYaw;
            lockEarth();
          } else {
            // Constant-friction profile derived from remaining distance lands at zero velocity exactly on target.
            yawVelocity = Math.sqrt(2 * brakeDecel * remaining);
            yaw += Math.min(yawVelocity * dtFactor, remaining);
          }
        }
      } else if (state === "EARTH_LOCK" || state === "ZOOMING_TO_INDIA" || state === "TIMELINE_LAYOUT") {
        // Scroll-bound zoom: ease the smoothed zoom value toward the scroll target, then
        // derive the discrete state so React layout + sphere-state stay in sync.
        if (reducedMotion) {
          zoom = zoomTarget;
        } else {
          zoom += (zoomTarget - zoom) * clamp(zoomEaseRate * dtFactor, 0, 1);

          if (Math.abs(zoomTarget - zoom) < 0.0015) {
            zoom = zoomTarget;
          }
        }

        if (zoom <= 0.002 && zoomTarget <= 0.002) {
          if (state !== "EARTH_LOCK") {
            setState("EARTH_LOCK");
          }
        } else if (zoom >= 0.998 && zoomTarget >= 0.998) {
          if (state !== "TIMELINE_LAYOUT") {
            timelineStartedAt = now;
            setState("TIMELINE_LAYOUT");
          }
        } else if (state !== "ZOOMING_TO_INDIA") {
          setState("ZOOMING_TO_INDIA");
        }
      } else if (state === "RETURNING_TO_HOME") {
        returnFrame += dtFactor;
        const progress = easeInOutCubic(clamp(returnFrame / returnFrames, 0, 1));
        zoom = mix(returnStartZoom, 0, progress);
        zoomTarget = 0;
        earthBlend = mix(returnStartBlend, 0, progress);
        yaw = mix(returnStartYaw, 0, progress);
        tilt = mix(returnStartTilt, 0, progress);

        if (returnFrame >= returnFrames) {
          snapHome();
        }
      }

      if (state === "HOME" && !spinAnnounced) {
        announceSpin();
      }

      // If /about was requested while the sphere was still forming, morph once it settles.
      if (state === "HOME" && desiredScene === "about" && !aboutMorphScheduled) {
        requestAbout();
      }

      context.clearRect(0, 0, width, height);

      if (
        state === "MORPHING_TO_EARTH" ||
        state === "EARTH_LOCK" ||
        state === "ZOOMING_TO_INDIA" ||
        state === "TIMELINE_LAYOUT" ||
        state === "RETURNING_TO_HOME"
      ) {
        drawEarth(now, width, height, dtFactor, darkMode);
      } else {
        drawSphere(now, width, height, dtFactor, darkMode);
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
    };

    const handleMorphToEarth = () => {
      beginEarthMorph();
    };

    const handleZoom = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;

      if (detail && typeof detail.progress === "number") {
        zoomTarget = clamp(detail.progress, 0, 1);
      }
    };

    const handleScene = (event: Event) => {
      const detail = (event as CustomEvent<{ scene: "home" | "about" }>).detail;

      if (detail?.scene === "about") {
        requestAbout();
      } else {
        resetToHome();
      }
    };

    const handleHomeScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;

      if (detail && typeof detail.progress === "number") {
        homeScrollTarget = clamp(detail.progress, 0, 1);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTargetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    resize();

    // Skip the loading screen: particles assemble straight into the sphere from their
    // scattered positions (reduced motion snaps to the formed sphere instead).
    if (!reducedMotion) {
      beginForming();
    }

    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", handleResize);
    window.addEventListener("sphere-morph-earth", handleMorphToEarth);
    window.addEventListener("earth-zoom", handleZoom);
    window.addEventListener("sphere-scene", handleScene);
    window.addEventListener("home-scroll", handleHomeScroll);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(earthDataTimeout);
      window.clearTimeout(aboutMorphTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sphere-morph-earth", handleMorphToEarth);
      window.removeEventListener("earth-zoom", handleZoom);
      window.removeEventListener("sphere-scene", handleScene);
      window.removeEventListener("home-scroll", handleHomeScroll);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return <canvas className="particle-sphere-loader" ref={canvasRef} aria-hidden="true" />;
}
