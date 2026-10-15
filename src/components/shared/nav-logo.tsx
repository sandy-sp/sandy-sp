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

  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    // The model's black metal has nothing to reflect and vanishes on ink; render it in ash.
    clone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const recolored = mats.map((m) => {
        if (m.name !== "MAT_Logo") return m;
        const ash = (m as THREE.MeshStandardMaterial).clone();
        ash.color.set("#9b938a");
        ash.metalness = 0.2;
        ash.roughness = 0.5;
        return ash;
      });
      mesh.material = Array.isArray(mesh.material) ? recolored : recolored[0];
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object: clone, scale: 1.75 / maxDim };
  }, [scene]);

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

export function NavLogo({ className = "block h-9 w-11" }: { className?: string }) {
  const handleRef = useRef<LogoHandle>(null);

  const trigger = (rate: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    handleRef.current?.spin(rate);
  };

  return (
    <span
      className={className}
      onPointerEnter={() => trigger(18)}
      onClick={() => trigger(9)}
    >
      <Canvas
        className="pointer-events-none"
        dpr={[1, 2]}
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 3], fov: 35 }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 3, 4]} intensity={1.8} />
        <directionalLight position={[-3, -1, 2]} intensity={0.7} color="#e5462e" />
        <Suspense fallback={null}>
          <Model handle={handleRef} />
        </Suspense>
      </Canvas>
    </span>
  );
}

useGLTF.preload(MODEL_URL);
