"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILL_CATEGORIES } from "@/data/experience";
import { setScene } from "@/components/scene/scene-state";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const SLIDE_SHIFT = 35; // xPercent each card travels on its way in or out
const HOLD = 1; // timeline units a card rests before the next one moves
const MOVE = 1; // timeline units a change takes

/**
 * The stack layers as a deck. The section pins while scrolling, and each step of
 * scroll slides the current card out to the left and the next one in from the right.
 * The scene's matching plate follows the card in view. After the last card the deck
 * stays pinned and the rest of the page (marked `.curtain`) slides up over it.
 */
export function StackDeck() {
  const ref = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const spacer = spacerRef.current;
    if (!root || !spacer) return;
    const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", root);
    const n = slides.length;
    const shift = prefersReducedMotion() ? 0 : SLIDE_SHIFT;

    const ctx = gsap.context(() => {
      gsap.set(slides.slice(1), { autoAlpha: 0, xPercent: shift });

      const tl = gsap.timeline();
      for (let i = 0; i < n - 1; i++) {
        const at = HOLD + i * (HOLD + MOVE);
        // The outgoing card is mostly clear before the incoming one lands.
        tl.to(slides[i], { autoAlpha: 0, xPercent: -shift, duration: MOVE * 0.6, ease: "power2.in" }, at);
        tl.to(slides[i + 1], { autoAlpha: 1, xPercent: 0, duration: MOVE * 0.6, ease: "power2.out" }, at + MOVE * 0.4);
      }
      tl.to({}, { duration: HOLD });
      const total = tl.duration();

      // A card counts as shown once its move is halfway done.
      const cardAt = (progress: number) => {
        const t = progress * total - HOLD - MOVE / 2;
        return Math.min(n - 1, Math.max(0, Math.floor(t / (HOLD + MOVE)) + 1));
      };

      // Cards change over the spacer's length of scroll.
      const deck = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${spacer.offsetHeight}`,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
      });
      // The deck stays put to the end of the page; what follows slides up over it.
      ScrollTrigger.create({ trigger: root, start: "top top", end: "max", pin: true, pinSpacing: false });
      ScrollTrigger.create({
        trigger: root,
        start: "top 55%",
        end: "max",
        onToggle: (self) => {
          if (self.isActive) setScene("stack", cardAt(deck.progress));
        },
        onUpdate: (self) => {
          if (self.isActive) setScene("stack", cardAt(deck.progress));
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={ref} aria-label="Stack layers" className="relative z-0 h-svh overflow-hidden">
        <div className="shell grid-12 h-full content-center">
          <div className="col-span-12 grid md:col-span-6 md:col-start-7">
            {SKILL_CATEGORIES.map((category, i) => (
              <article key={category.title} data-slide="" className="[grid-area:1/1] border-y border-rule py-10">
                <p className="t-mono mb-3">
                  <span className="text-ember!">{String(i + 1).padStart(2, "0")}</span> /{" "}
                  {String(SKILL_CATEGORIES.length).padStart(2, "0")}
                </p>
                <h2 className="t-display-2 mb-8">{category.title}</h2>
                <ul>
                  {category.skills.map((skill) => (
                    <li key={skill} className="t-body border-t border-rule py-4">
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* Scroll room for the card changes; the deck stays pinned behind it. */}
      <div ref={spacerRef} aria-hidden="true" style={{ height: `${(SKILL_CATEGORIES.length - 1) * 90}svh` }} />
    </>
  );
}
