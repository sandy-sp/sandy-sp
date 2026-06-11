"use client";

import { useEffect, useRef } from "react";

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
  startX: number;
  startY: number;
  x: number;
  y: number;
  radius: number;
  delay: number;
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

function makeEdgeStart(width: number, height: number) {
  const side = Math.floor(Math.random() * 4);
  const gutter = 40;

  if (side === 0) {
    return { x: Math.random() * width, y: -gutter };
  }

  if (side === 1) {
    return { x: width + gutter, y: Math.random() * height };
  }

  if (side === 2) {
    return { x: Math.random() * width, y: height + gutter };
  }

  return { x: -gutter, y: Math.random() * height };
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

function buildHexSphereMesh(radius: number) {
  const subdivisions = 4;
  const tileInset = 0.92;
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
        const insetPoint = normalizePoint(
          {
            x: center.x + (centroid.x - center.x) * tileInset,
            y: center.y + (centroid.y - center.y) * tileInset,
            z: center.z + (centroid.z - center.z) * tileInset,
          },
          radius,
        );

        return {
          angle,
          index: getPointIndex(insetPoint),
        };
      })
      .sort((left, right) => left.angle - right.angle)
      .map((item) => item.index);

    for (let edgeIndex = 0; edgeIndex < boundaryIndexes.length; edgeIndex += 1) {
      addEdge(boundaryIndexes[edgeIndex], boundaryIndexes[(edgeIndex + 1) % boundaryIndexes.length]);
    }
  }

  return { points, edges, radius };
}

function projectPoint(point: MeshPoint, radius: number, centerX: number, centerY: number, rotation: number): ProjectedPoint {
  const cosY = Math.cos(rotation);
  const sinY = Math.sin(rotation);
  const cosX = Math.cos(rotation * 0.42);
  const sinX = Math.sin(rotation * 0.42);
  const rotatedX = point.x * cosY + point.z * sinY;
  const rotatedZ = point.z * cosY - point.x * sinY;
  const rotatedY = point.y * cosX - rotatedZ * sinX;
  const finalZ = point.y * sinX + rotatedZ * cosX;
  const focalLength = radius * 4.2;
  const scale = focalLength / (focalLength - finalZ);

  return {
    x: centerX + rotatedX * scale,
    y: centerY + rotatedY * scale,
    scale,
    depth: finalZ,
  };
}

export function ParticleSphereLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let particles: Particle[] = [];
    let projected: ProjectedPoint[] = [];
    let mesh = buildHexSphereMesh(220);
    let maxParticleDelay = 0;
    let startedAt = performance.now();
    let spinStarted = false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const sphereRadius = Math.min(width, height) * 0.29;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      mesh = buildHexSphereMesh(sphereRadius);
      maxParticleDelay = 0;
      spinStarted = false;
      particles = mesh.points.map((point, index) => {
        const start = makeEdgeStart(width, height);
        const depth = Math.hypot(point.x, point.y) / sphereRadius;
        const delay = mediaQuery.matches ? 0 : Math.random() * 1700 + depth * 520 + (index % 9) * 18;
        maxParticleDelay = Math.max(maxParticleDelay, delay);

        return {
          startX: start.x,
          startY: start.y,
          x: start.x,
          y: start.y,
          radius: 0.85 + (1 - depth) * 0.95 + Math.random() * 0.55,
          delay,
          depth,
        };
      });
      projected = mesh.points.map((point) => projectPoint(point, mesh.radius, width / 2, height / 2, 0));
      startedAt = performance.now();
    };

    const draw = (now: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const elapsed = now - startedAt;
      const formationDuration = mediaQuery.matches ? 1 : 8200;
      const travelDuration = Math.max(1, formationDuration - maxParticleDelay);
      const settleAt = formationDuration + 800;
      const spinElapsed = Math.max(0, elapsed - settleAt);
      const spinRamp = clamp(spinElapsed / 2200, 0, 1);
      const settled = mediaQuery.matches || elapsed > formationDuration;
      const rotation = mediaQuery.matches ? 0 : spinElapsed * 0.00012 * spinRamp;
      const lineProgress = mediaQuery.matches ? 1 : easeOutCubic(clamp((elapsed - formationDuration * 0.74) / 2100, 0, 1));
      const darkMode = document.documentElement.dataset.theme === "dark";
      const dotBase = darkMode ? "214, 92, 92" : "153, 51, 51";
      const dotGlow = darkMode ? "236, 121, 121" : "153, 51, 51";
      const lineBase = "118, 118, 118";

      if (!spinStarted && (mediaQuery.matches || spinElapsed > 0)) {
        spinStarted = true;
        window.dispatchEvent(new CustomEvent("sphere-spin-start"));
      }

      context.clearRect(0, 0, width, height);
      projected = mesh.points.map((point) => projectPoint(point, mesh.radius, width / 2, height / 2, rotation));

      context.save();
      context.globalCompositeOperation = "source-over";
      context.lineCap = "round";

      const particleOrder = particles
        .map((particle, index) => ({ index, particle, target: projected[index] }))
        .sort((left, right) => left.target.depth - right.target.depth);
      const displayPoints: DisplayPoint[] = [];

      for (const item of particleOrder) {
        const { index, particle, target } = item;
        const progress = clamp((elapsed - particle.delay) / travelDuration, 0, 1);
        const eased = mediaQuery.matches ? 1 : easeOutCubic(progress);
        const drift = settled ? Math.sin(now * 0.0015 + index) * 0.75 : 0;
        const depthVisibility = smoothstep(-mesh.radius * 0.38, mesh.radius * 0.12, target.depth);

        particle.x = particle.startX + (target.x - particle.startX) * eased;
        particle.y = particle.startY + (target.y - particle.startY) * eased;

        const glow = (0.14 + eased * 0.56) * (0.35 + depthVisibility * 0.65);
        const dotRadius = (particle.radius + (target.scale - 1) * 2.2) * (0.62 + eased * 0.38);

        displayPoints[index] = {
          ...target,
          x: particle.x + drift,
          y: particle.y - drift,
          opacity: eased * depthVisibility,
          radius: dotRadius * (0.82 + depthVisibility * 0.18),
        };

        context.shadowColor = `rgba(${dotGlow}, ${0.14 + glow * 0.34})`;
        context.shadowBlur = (3 + eased * 7) * depthVisibility;
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
        const opacity = (darkMode ? 0.14 : 0.12) * mergeProgress + clamp(lineDepth + 0.24, 0, darkMode ? 0.36 : 0.28) * mergeProgress * depthVisibility;

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
        context.lineWidth = (darkMode ? 0.68 : 0.62) + ((a.scale + b.scale) / 2 - 1) * (darkMode ? 1.14 : 1.05);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      }

      context.restore();
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="particle-sphere-loader" ref={canvasRef} aria-hidden="true" />;
}
