"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scene, setScene, type SceneName } from "@/components/scene/scene-state";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function scrollToTarget(target: string | number) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView();
  else window.scrollTo(0, target);
}

/** Lenis inertial scroll synced to ScrollTrigger. Off under reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenis.on("scroll", (instance: Lenis) => {
      scene.velocity = Math.abs(instance.velocity);
      ScrollTrigger.update();
    });
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}

let unbind: (() => void) | null = null;

/**
 * Binds every `[data-scene]` section in the document to a scene state. Call again
 * after a page swaps its own sections (e.g. a view toggle) without a route change.
 */
export function rebindScenes() {
  unbind?.();

  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
  const apply = (el: HTMLElement) =>
    setScene(el.dataset.scene as SceneName, el.dataset.part ? Number(el.dataset.part) : -1);

  const triggers = sections.map((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (self.isActive) apply(el);
      },
    }),
  );
  // Before any trigger is active (top of page), the first section sets the scene.
  const active = triggers.findIndex((t) => t.isActive);
  if (active >= 0) apply(sections[active]);
  else if (sections[0]) apply(sections[0]);

  // Layout settles after fonts and split text; measure again once it has.
  const id = requestAnimationFrame(() => ScrollTrigger.refresh());

  unbind = () => {
    cancelAnimationFrame(id);
    triggers.forEach((t) => t.kill());
  };
}

/**
 * Maps every `[data-scene]` section on the current page to a scene state.
 * Re-binds on each route change.
 */
export function SceneDirector() {
  const pathname = usePathname();

  useEffect(() => {
    // New route starts at the top, unless it was reached through an anchor.
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      requestAnimationFrame(() => scrollToTarget(hash));
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }

    scene.preview = null;
    scene.hoverPart = -1;
    scene.heat = 0;

    rebindScenes();
    return () => {
      unbind?.();
      unbind = null;
    };
  }, [pathname]);

  return null;
}
