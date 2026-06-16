"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import * as THREE from "three";

const MODEL_URL = "/logo-sp.glb";
const FULL_TURN = Math.PI * 2;

type LogoHandle = { spin: (rate: number) => void };

function Model({ handle }: { handle: Ref<LogoHandle> }) {
  const groupRef = useRef<THREE.Group>(null);
  const pending = useRef(0);
  const speed = useRef(9);
  const { scene } = useGLTF(MODEL_URL);

  // Clone, center at origin, normalize to a unit size so it fits regardless of export.
  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object: clone, scale: 1.7 / maxDim };
  }, [scene]);

  // Queue one full turn, but only when not already mid-spin (no hover-spam stacking).
  useImperativeHandle(
    handle,
    () => ({
      spin(rate: number) {
        if (pending.current <= 0.0001) {
          pending.current = FULL_TURN;
          speed.current = rate;
        }
      },
    }),
    [],
  );

  // Consume the pending rotation budget; otherwise hold still (no idle spin).
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || pending.current <= 0) return;
    const step = Math.min(speed.current * delta, pending.current);
    group.rotation.y += step;
    pending.current -= step;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={object} />
    </group>
  );
}

export function NavLogo({ className = "block h-9 w-12" }: { className?: string }) {
  const handleRef = useRef<LogoHandle>(null);

  const trigger = (rate: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    handleRef.current?.spin(rate);
  };

  return (
    <span
      className={className}
      onPointerEnter={() => trigger(18)} // hover: quick single spin
      onClick={() => trigger(9)} // click: 360° at normal speed
    >
      <Canvas
        className="pointer-events-none"
        dpr={[1, 2]}
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 3], fov: 35 }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={1.6} />
        <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#993333" />
        <Suspense fallback={null}>
          <Model handle={handleRef} />
        </Suspense>
      </Canvas>
    </span>
  );
}

useGLTF.preload(MODEL_URL);
