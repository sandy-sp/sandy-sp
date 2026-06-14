"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Pixelismo-style background: glossy 3D objects floating in zero-g, drifting gently,
// scattering away from the cursor. Reflections come from a drei Environment preset
// (no HDR file shipped). Physics is a lightweight velocity model — no engine dep.

const HALF = { x: 8, y: 4.5, z: 2.5 };
const REPEL_RADIUS = 3.4;
const REPEL_STRENGTH = 1.1;
const CENTER_SPRING = 0.012;
const DAMPING = 0.93;

type Body = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function buildBodies(count: number): Body[] {
  return Array.from({ length: count }, () => ({
    pos: new THREE.Vector3(rand(-HALF.x, HALF.x), rand(-HALF.y, HALF.y), rand(-HALF.z, HALF.z)),
    vel: new THREE.Vector3(rand(-0.1, 0.1), rand(-0.1, 0.1), rand(-0.05, 0.05)),
    rot: new THREE.Euler(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)),
    rotVel: new THREE.Vector3(rand(-0.01, 0.01), rand(-0.01, 0.01), rand(-0.01, 0.01)),
    scale: rand(0.55, 1.15),
  }));
}

type Scratch = {
  bodies: Body[];
  dummy: THREE.Object3D;
  raycaster: THREE.Raycaster;
  plane: THREE.Plane;
};

function FloatingObjects() {
  const { camera } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const count = useMemo(() => {
    if (typeof window === "undefined") return 28;
    return window.innerWidth < 768 ? 14 : 40;
  }, []);

  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.18), []);

  // All per-frame mutable scene state lives behind a ref so the render loop never
  // mutates memoized values (React Compiler forbids that).
  const scratchRef = useRef<Scratch | null>(null);
  if (scratchRef.current === null) {
    scratchRef.current = {
      bodies: buildBodies(count),
      dummy: new THREE.Object3D(),
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    };
  }

  const pointerNdc = useRef(new THREE.Vector2(2, 2)); // off-screen until first move
  const pointerWorld = useRef(new THREE.Vector3());
  const hasPointer = useRef(false);
  const reduced = useRef(false);
  const seeded = useRef(false);

  // Track the cursor on the window (the canvas itself is pointer-events:none so page
  // content stays clickable). Repel still works because we map clientX/Y to NDC here.
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (event: PointerEvent) => {
      pointerNdc.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      hasPointer.current = true;
    };

    const onLeave = () => {
      hasPointer.current = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, []);

  // Theme-aware object tint (brand red on light, near-white on dark).
  useEffect(() => {
    const apply = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      materialRef.current?.color.set(dark ? "#e7e2e2" : "#b07a7a");
    };
    apply();
    window.addEventListener("portfolio-theme", apply);
    return () => window.removeEventListener("portfolio-theme", apply);
  }, []);

  const writeMatrices = () => {
    const mesh = meshRef.current;
    const scratch = scratchRef.current;
    if (!mesh || !scratch) return;
    const { bodies, dummy } = scratch;
    for (let i = 0; i < bodies.length; i += 1) {
      const b = bodies[i];
      dummy.position.copy(b.pos);
      dummy.rotation.copy(b.rot);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const scratch = scratchRef.current;
    if (!mesh || !scratch) return;
    const { bodies, dummy, raycaster, plane } = scratch;

    // Reduced motion: lay them out once, then hold still.
    if (reduced.current) {
      if (!seeded.current) {
        writeMatrices();
        seeded.current = true;
      }
      return;
    }

    const dt = Math.min(delta, 0.05) * 60; // normalize to ~60fps steps, cap spikes

    // Project cursor onto the z=0 plane.
    if (hasPointer.current) {
      raycaster.setFromCamera(pointerNdc.current, camera);
      raycaster.ray.intersectPlane(plane, pointerWorld.current);
    }

    for (let i = 0; i < bodies.length; i += 1) {
      const b = bodies[i];

      // Cursor repel.
      if (hasPointer.current) {
        const dx = b.pos.x - pointerWorld.current.x;
        const dy = b.pos.y - pointerWorld.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS && dist > 0.0001) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          b.vel.x += (dx / dist) * force * dt;
          b.vel.y += (dy / dist) * force * dt;
        }
      }

      // Soft pull back toward the volume center so they never drift away.
      b.vel.x -= b.pos.x * CENTER_SPRING * dt;
      b.vel.y -= b.pos.y * CENTER_SPRING * dt;
      b.vel.z -= b.pos.z * CENTER_SPRING * dt;

      b.vel.multiplyScalar(DAMPING);

      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.pos.z += b.vel.z * dt;

      b.rot.x += b.rotVel.x * dt;
      b.rot.y += b.rotVel.y * dt;
      b.rot.z += b.rotVel.z * dt;

      dummy.position.copy(b.pos);
      dummy.rotation.copy(b.rot);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    const g = geometry;
    return () => g.dispose();
  }, [geometry]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial
        ref={materialRef}
        metalness={0.85}
        roughness={0.18}
        envMapIntensity={1.1}
      />
    </instancedMesh>
  );
}

export function WorkBackground() {
  return (
    <div className="work-bg-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 14], fov: 50 }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 7, 8]} intensity={1.1} />
        <directionalLight position={[-7, -4, 3]} intensity={0.55} color="#993333" />
        <FloatingObjects />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
