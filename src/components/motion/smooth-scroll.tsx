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

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    if (sections[0]) setScene(sections[0].dataset.scene as SceneName);

    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setScene(el.dataset.scene as SceneName);
        },
      }),
    );
    // Layout settles after fonts and split text; measure again once it has.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}
