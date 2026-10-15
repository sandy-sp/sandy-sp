"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { EASE_OUT, STAGGER, T_REVEAL, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

type Props = {
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "ol" | "ul";
  children: ReactNode;
  className?: string;
  /** Play on mount instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
  id?: string;
};

/**
 * Line-masked text reveal. Lines rise out of their own mask with a 40ms stagger.
 * Content is hidden by CSS only while `html.motion` is set, with a timed fallback,
 * so text is never lost if scripts fail.
 */
export function RevealText({ as = "div", children, className, immediate, delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 130, // clears the mask, including its descender padding
            duration: T_REVEAL,
            ease: EASE_OUT,
            stagger: STAGGER,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [immediate, delay]);

  // Typed as div: all allowed tags share the HTMLElement props used here.
  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

/** Block reveal for non-text groups: rise 24px and fade, staggered across children. */
export function Reveal({
  as = "div",
  children,
  className,
  stagger = false,
  id,
}: Omit<Props, "immediate" | "delay"> & { stagger?: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger ? Array.from(el.children) : [el];
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(targets, {
        autoAlpha: 0,
        y: reduced ? 0 : 24,
        duration: reduced ? 0.3 : T_REVEAL,
        ease: EASE_OUT,
        stagger: stagger ? 0.06 : 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger]);

  // Typed as div: all allowed tags share the HTMLElement props used here.
  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
