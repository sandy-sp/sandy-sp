"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLogo } from "@/components/shared/nav-logo";

type NavCell = {
  label: string;
  href: string;
  ariaLabel: string;
  logo?: boolean;
};

const cells: NavCell[] = [
  { label: "VIEW_WORK", href: "/open-source-projects", ariaLabel: "View work" },
  { label: "HOME", href: "/", ariaLabel: "Home", logo: true },
  { label: "ABOUT_ME", href: "/about", ariaLabel: "About me" },
];

const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_<>#";

function useScramble(target: string) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return () => {
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (reducedMotionRef.current) {
      return;
    }

    window.cancelAnimationFrame(frameRef.current);

    const startedAt = performance.now();
    const duration = 360;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const settled = Math.floor(progress * target.length);

      const next = target
        .split("")
        .map((char, position) => {
          if (position < settled || char === "_" || char === "/") {
            return char;
          }

          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join("");

      setDisplay(next);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
  }, [target]);

  return { display, start };
}

function BentoCell({
  cell,
  active,
  side,
}: {
  cell: NavCell;
  active: boolean;
  side: "left" | "center" | "right";
}) {
  const { display, start } = useScramble(cell.label);

  // Outer corner is pill-round, inner corner (toward the logo) stays tight.
  const rounding =
    side === "left"
      ? "rounded-l-full rounded-r-md"
      : side === "right"
        ? "rounded-r-full rounded-l-md"
        : "rounded-md";

  const boxedClass = [
    "group flex items-center justify-center border-[0.5px] px-4 py-2 sm:px-6 sm:py-3 text-center backdrop-blur-md",
    rounding,
    "transition-[border-color,background-color,box-shadow] duration-300 ease-out min-h-11",
    "hover:border-accent/50 hover:bg-accent/10 hover:shadow-[0_0_18px_-6px_var(--accent)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-0",
    active
      ? "border-accent/60 bg-accent/15 shadow-[0_0_18px_-6px_var(--accent)]"
      : "border-foreground/10 bg-surface/60",
  ].join(" ");
  // The logo cell is bare — no card box around it.
  const bareClass =
    "group flex items-center justify-center rounded-md min-h-11 px-1 sm:px-2 transition-transform duration-300 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70";
  const cellClass = cell.logo ? bareClass : boxedClass;
  const labelClass = `font-[family-name:var(--font-share-tech-mono,var(--font-geist-mono),monospace)] text-[0.7rem] sm:text-sm tracking-[0.04em] sm:tracking-[0.06em] transition-colors duration-300 group-hover:text-accent ${
    active ? "text-accent" : "text-foreground"
  }`;

  return (
    <Link
      className={cellClass}
      href={cell.href}
      aria-label={cell.ariaLabel}
      aria-current={active ? "page" : undefined}
      onPointerEnter={start}
      onFocus={start}
    >
      {cell.logo ? <NavLogo /> : <span className={labelClass}>{display}</span>}
    </Link>
  );
}

export function HomeNavOverlay() {
  const [isReady, setIsReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Retract the dock up off-screen once the user scrolls into the home morph so it can't
  // be clicked. Fires only on the home page; resets when leaving (home-bio sends 0).
  useEffect(() => {
    const handleHomeScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      setIsScrolled(Boolean(detail) && detail.progress > 0.02);
    };

    window.addEventListener("home-scroll", handleHomeScroll);

    return () => window.removeEventListener("home-scroll", handleHomeScroll);
  }, []);

  useEffect(() => {
    // The canvas persists across navigations, so the spin event may have already fired.
    if ((window as typeof window & { __sphereSpun?: boolean }).__sphereSpun) {
      const id = window.requestAnimationFrame(() => setIsReady(true));
      return () => window.cancelAnimationFrame(id);
    }

    const handleSpinStart = () => {
      setIsReady(true);
    };

    window.addEventListener("sphere-spin-start", handleSpinStart, { once: true });

    return () => {
      window.removeEventListener("sphere-spin-start", handleSpinStart);
    };
  }, []);

  // Float down from above the top edge on entry; float back up out of frame on scroll.
  const stateClass = isScrolled
    ? "-translate-y-[180%] opacity-0"
    : isReady
      ? "translate-y-0 opacity-100"
      : "-translate-y-[180%] opacity-0";
  const pointerClass = isReady && !isScrolled ? "pointer-events-auto" : "pointer-events-none";

  return (
    <nav
      aria-label="Primary"
      className={`fixed left-1/2 top-4 z-[9] flex -translate-x-1/2 items-stretch gap-1 transition-[opacity,translate] duration-700 ease-out ${stateClass} ${pointerClass}`}
    >
      {cells.map((cell, i) => (
        <BentoCell
          key={cell.label}
          cell={cell}
          side={i === 0 ? "left" : i === cells.length - 1 ? "right" : "center"}
          active={cell.href === "/" ? pathname === "/" : pathname.startsWith(cell.href)}
        />
      ))}
    </nav>
  );
}
