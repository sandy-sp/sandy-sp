"use client";

import { useEffect, useRef } from "react";
import { FRAGMENT, MAX_PINS, VERTEX } from "./lava-shader";
import { scene, sceneParams, type SceneParams } from "./scene-state";

const CAM_Z = 7.2;
const FOCAL = 3.8;
const HALF_H = CAM_Z / FOCAL; // world half-height at z = 0
const SETTLE = 3.2; // exp damping per second, ~1.2s to settle
const MOBILE_QUERY = "(max-width: 800px)";
const DEG = Math.PI / 180;

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

/** Equirectangular land mask (1024x512) rasterized from the bundled coastlines. */
async function buildLandMask() {
  const { worldCoastlines } = await import("@/data/earth-geo");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "#fff";
  for (const feature of worldCoastlines.features) {
    for (const ring of feature.geometry.coordinates) {
      ctx.beginPath();
      ring.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * 1024;
        const y = ((90 - lat) / 180) * 512;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    }
  }
  return canvas;
}

/** World -> globe-local rotation that brings (lat, lon) to face the camera. Column-major. */
function globeMatrix(lat: number, lon: number, out: Float32Array) {
  // M = Ry(lon) * Rx(-lat)
  const ca = Math.cos(-lat), sa = Math.sin(-lat);
  const cb = Math.cos(lon), sb = Math.sin(lon);
  // Row-major entries of M
  const m00 = cb, m01 = sb * sa, m02 = sb * ca;
  const m10 = 0, m11 = ca, m12 = -sa;
  const m20 = -sb, m21 = cb * sa, m22 = cb * ca;
  out.set([m00, m10, m20, m01, m11, m21, m02, m12, m22]);
  return out;
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
      globe: u("uGlobe"),
      modules: u("uModules"),
      layers: u("uLayers"),
      dim: u("uDim"),
      heat: u("uHeat"),
      flow: u("uFlow"),
      part: u("uPart"),
      partLift: u("uPartLift"),
      project: u("uProject"),
      morph: u("uMorph"),
      globeRot: u("uGlobeRot"),
      land: u("uLand"),
      landReady: u("uLandReady"),
      pins: u("uPins"),
      pinCount: u("uPinCount"),
    };

    // Land texture starts empty; the coastline data loads the first time a globe is needed.
    const landTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, landTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uni.land, 0);
    gl.uniform1f(uni.landReady, 0);
    let landRequested = false;
    let disposed = false;
    const requestLand = () => {
      if (landRequested) return;
      landRequested = true;
      buildLandMask().then((mask) => {
        if (disposed) return;
        gl.bindTexture(gl.TEXTURE_2D, landTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
        gl.uniform1f(uni.landReady, 1);
      });
    };

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let reduced = reducedQuery.matches;
    let mobile = mobileQuery.matches;

    // Current (damped) values start at the target so the first frame is already composed.
    const current: SceneParams & { heat: number; flow: number; lift: number; morph: number } = {
      ...sceneParams(scene.name, mobile),
      heat: 0,
      flow: 0,
      lift: 0,
      morph: 0,
    };
    let shownPart = -1;
    let shownProject = -1;
    const globeView = { lat: 20 * DEG, lon: 78 * DEG };
    const rotMatrix = new Float32Array(9);
    const pinData = new Float32Array(MAX_PINS * 3);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, tOn: 0 };
    let aspect = 1;
    let cssW = 1;
    let cssH = 1;
    // Adaptive quality: 1 = full pixel budget. Drops when frames run long.
    let quality = 1;
    let slowFrames = 0;
    let sampled = 0;

    // Raymarching is per-pixel, so cap the pixel budget instead of trusting DPR.
    const resize = () => {
      cssW = canvas.clientWidth || window.innerWidth;
      cssH = canvas.clientHeight || window.innerHeight;
      const budget = (mobile ? 450_000 : 1_300_000) * quality;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = Math.min(dpr, Math.sqrt(budget / (cssW * cssH)));
      canvas.width = Math.round(cssW * s);
      canvas.height = Math.round(cssH * s);
      aspect = cssW / cssH;
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
      const rawDt = (now - last) / 1000;
      const dt = Math.min(rawDt, 0.05);
      last = now;

      // Every 90 frames: if a third ran under ~45fps, shed 30% of the pixels.
      sampled++;
      if (rawDt > 1 / 45) slowFrames++;
      if (sampled === 90) {
        if (slowFrames > 30 && quality > 0.3) {
          quality *= 0.7;
          resize();
        }
        sampled = 0;
        slowFrames = 0;
      }

      const flowTarget = reduced ? 0 : Math.min(scene.velocity / 40, 0.5);
      time += dt * (reduced ? 0.15 : 1 + current.flow * 1.5);

      const k = 1 - Math.exp(-dt * SETTLE);
      // A hover preview borrows the destination's shape but stays where the section put the form.
      const place = sceneParams(scene.name, mobile);
      const target = scene.preview
        ? { ...sceneParams(scene.preview, mobile), x: place.x, y: place.y, scale: place.scale, dim: place.dim }
        : place;
      if (target.globe > 0) requestLand();
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      current.scale += (target.scale - current.scale) * k;
      current.nodes += (target.nodes - current.nodes) * k;
      current.line += (target.line - current.line) * k;
      current.ring += (target.ring - current.ring) * k;
      current.globe += (target.globe - current.globe) * k;
      current.modules += (target.modules - current.modules) * k;
      current.layers += (target.layers - current.layers) * k;
      current.dim += (target.dim - current.dim) * k;
      current.heat += (scene.heat - current.heat) * (1 - Math.exp(-dt * 6));
      current.flow += (flowTarget - current.flow) * (1 - Math.exp(-dt * 4));

      // Active part: lower the old one fully before raising the new one.
      const wantPart = scene.preview ? -1 : scene.hoverPart >= 0 ? scene.hoverPart : scene.part;
      const pk = 1 - Math.exp(-dt * 7);
      if (wantPart !== shownPart) {
        current.lift += (0 - current.lift) * pk;
        if (current.lift < 0.02) shownPart = wantPart;
      } else {
        current.lift += ((shownPart >= 0 ? 1 : 0) - current.lift) * pk;
      }

      // On a project page the module grid morphs into that project's motif. Switching
      // projects goes back through the grid.
      const onProject = !scene.preview && (scene.name === "project" || scene.name === "projectAside");
      const wantProject = onProject ? scene.part : -1;
      const mk2 = 1 - Math.exp(-dt * 2.4);
      if (wantProject !== shownProject) {
        current.morph += (0 - current.morph) * mk2 * 1.5;
        if (current.morph < 0.02) shownProject = wantProject;
      } else {
        current.morph += ((shownProject >= 0 ? 1 : 0) - current.morph) * mk2;
      }

      // Globe turns to the active pin; with no active pin it drifts slowly.
      const pins = scene.pins;
      const activePin = scene.name === "globe" && scene.part >= 0 ? pins[scene.part] : undefined;
      const gk = 1 - Math.exp(-dt * 2.2);
      if (activePin) {
        const tLat = activePin.lat * DEG * 0.85;
        let dLon = activePin.lon * DEG - globeView.lon;
        dLon = Math.atan2(Math.sin(dLon), Math.cos(dLon));
        globeView.lon += dLon * gk;
        globeView.lat += (tLat - globeView.lat) * gk;
      } else {
        globeView.lon -= dt * (reduced ? 0.02 : 0.08);
        globeView.lat += (15 * DEG - globeView.lat) * gk;
      }
      globeMatrix(globeView.lat, globeView.lon, rotMatrix);

      // Waypoints share the state of the pin they lead to; +4 marks them as unpinned.
      const active = scene.name === "globe" ? scene.part : -1;
      let count = 0;
      const push = (lat: number, lon: number, state: number) => {
        if (count >= MAX_PINS) return;
        pinData[count * 3] = lat * DEG;
        pinData[count * 3 + 1] = lon * DEG;
        pinData[count * 3 + 2] = state;
        count++;
      };
      for (let i = 0; i < pins.length; i++) {
        const state = i === active ? 2 : i < active ? 1 : 0;
        for (const v of pins[i].via ?? []) push(v.lat, v.lon, state + 4);
        push(pins[i].lat, pins[i].lon, state);
      }

      const mk = 1 - Math.exp(-dt * 4);
      pointer.x += (pointer.tx - pointer.x) * mk;
      pointer.y += (pointer.ty - pointer.y) * mk;
      pointer.on += ((reduced ? 0 : pointer.tOn) - pointer.on) * mk;

      const halfW = HALF_H * aspect;
      const ox = current.x * halfW;
      const oy = current.y * HALF_H;
      gl.uniform1f(uni.time, time);
      gl.uniform2f(uni.mouse, pointer.x * halfW, pointer.y * HALF_H);
      gl.uniform1f(uni.mouseOn, pointer.on * (1 - current.globe * 0.7));
      gl.uniform2f(uni.offset, ox, oy);
      gl.uniform1f(uni.scale, current.scale);
      gl.uniform1f(uni.nodes, current.nodes);
      gl.uniform1f(uni.line, current.line);
      gl.uniform1f(uni.ring, current.ring);
      gl.uniform1f(uni.globe, current.globe);
      gl.uniform1f(uni.modules, current.modules);
      gl.uniform1f(uni.layers, current.layers);
      gl.uniform1f(uni.dim, current.dim);
      gl.uniform1f(uni.heat, current.heat);
      gl.uniform1f(uni.flow, current.flow);
      gl.uniform1f(uni.part, shownPart);
      gl.uniform1f(uni.partLift, current.lift);
      gl.uniform1f(uni.project, shownProject);
      gl.uniform1f(uni.morph, current.morph);
      gl.uniformMatrix3fv(uni.globeRot, false, rotMatrix);
      gl.uniform3fv(uni.pins, pinData);
      gl.uniform1f(uni.pinCount, current.globe > 0.01 ? count : 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, landTex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Keep the pin label on the active pin: rotate back to world space, then project.
      const label = scene.pinLabel;
      if (label) {
        if (activePin && current.globe > 0.6) {
          const la = activePin.lat * DEG, lo = activePin.lon * DEG;
          const px = Math.cos(la) * Math.sin(lo), py = Math.sin(la), pz = Math.cos(la) * Math.cos(lo);
          // world = M^T * local (M is orthonormal, column-major in rotMatrix)
          const m = rotMatrix;
          const wx = m[0] * px + m[1] * py + m[2] * pz;
          const wy = m[3] * px + m[4] * py + m[5] * pz;
          const wz = m[6] * px + m[7] * py + m[8] * pz;
          const P = [ox + wx * current.scale, oy + wy * current.scale, wz * current.scale];
          const f = FOCAL / (CAM_Z - P[2]);
          const sx = (P[0] * f * cssH + cssW) / 2;
          const sy = cssH - (P[1] * f * cssH + cssH) / 2;
          label.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
          label.style.opacity = wz > 0.2 ? String(Math.min(1, (current.globe - 0.6) * 2.5)) : "0";
        } else {
          label.style.opacity = "0";
        }
      }
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
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery.removeEventListener("change", onReduced);
      mobileQuery.removeEventListener("change", onMobile);
      gl.deleteTexture(landTex);
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
