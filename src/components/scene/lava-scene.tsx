"use client";

import { useEffect, useRef } from "react";
import { FRAGMENT, VERTEX } from "./lava-shader";
import { scene, sceneParams, type SceneParams } from "./scene-state";

const CAM_Z = 3.6;
const FOCAL = 1.9;
const HALF_H = CAM_Z / FOCAL; // world half-height at z = 0
const SETTLE = 3.2; // exp damping per second, ~1.2s to settle
const MOBILE_QUERY = "(max-width: 800px)";

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Fixed full-viewport WebGL form behind every page. */
export function LavaScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uni = {
      res: u("uRes"),
      time: u("uTime"),
      mouse: u("uMouse"),
      mouseOn: u("uMouseOn"),
      offset: u("uOffset"),
      scale: u("uScale"),
      nodes: u("uNodes"),
      line: u("uLine"),
      ring: u("uRing"),
      dim: u("uDim"),
      heat: u("uHeat"),
      flow: u("uFlow"),
    };

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let reduced = reducedQuery.matches;
    let mobile = mobileQuery.matches;

    // Current (damped) values start at the target so the first frame is already composed.
    const current: SceneParams & { heat: number; flow: number } = {
      ...sceneParams(scene.name, mobile),
      heat: 0,
      flow: 0,
    };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, tOn: 0 };
    let aspect = 1;

    // Raymarching is per-pixel, so cap the pixel budget instead of trusting DPR.
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const budget = mobile ? 450_000 : 1_100_000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = Math.min(dpr, Math.sqrt(budget / (w * h)));
      canvas.width = Math.round(w * s);
      canvas.height = Math.round(h * s);
      aspect = w / h;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.res, canvas.width, canvas.height);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.tOn = 1;
    };
    const onLeave = () => {
      pointer.tOn = 0;
    };
    const onReduced = () => (reduced = reducedQuery.matches);
    const onMobile = () => {
      mobile = mobileQuery.matches;
      resize();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    reducedQuery.addEventListener("change", onReduced);
    mobileQuery.addEventListener("change", onMobile);

    let raf = 0;
    let last = performance.now();
    let time = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const flowTarget = reduced ? 0 : Math.min(scene.velocity / 40, 0.5);
      time += dt * (reduced ? 0.15 : 1 + current.flow * 1.5);

      const k = 1 - Math.exp(-dt * SETTLE);
      const target = sceneParams(scene.name, mobile);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      current.scale += (target.scale - current.scale) * k;
      current.nodes += (target.nodes - current.nodes) * k;
      current.line += (target.line - current.line) * k;
      current.ring += (target.ring - current.ring) * k;
      current.dim += (target.dim - current.dim) * k;
      current.heat += (scene.heat - current.heat) * (1 - Math.exp(-dt * 6));
      current.flow += (flowTarget - current.flow) * (1 - Math.exp(-dt * 4));

      const pk = 1 - Math.exp(-dt * 4);
      pointer.x += (pointer.tx - pointer.x) * pk;
      pointer.y += (pointer.ty - pointer.y) * pk;
      pointer.on += ((reduced ? 0 : pointer.tOn) - pointer.on) * pk;

      const halfW = HALF_H * aspect;
      gl.uniform1f(uni.time, time);
      gl.uniform2f(uni.mouse, pointer.x * halfW, pointer.y * HALF_H);
      gl.uniform1f(uni.mouseOn, pointer.on);
      gl.uniform2f(uni.offset, current.x * halfW, current.y * HALF_H);
      gl.uniform1f(uni.scale, current.scale);
      gl.uniform1f(uni.nodes, current.nodes);
      gl.uniform1f(uni.line, current.line);
      gl.uniform1f(uni.ring, current.ring);
      gl.uniform1f(uni.dim, current.dim);
      gl.uniform1f(uni.heat, current.heat);
      gl.uniform1f(uni.flow, current.flow);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);
    canvas.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery.removeEventListener("change", onReduced);
      mobileQuery.removeEventListener("change", onMobile);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-[1200ms] data-[ready=true]:opacity-100"
      style={{ transitionTimingFunction: "var(--ease-scene)" }}
    />
  );
}
