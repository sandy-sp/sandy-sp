"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RollLink } from "@/components/ui/roll-link";
import { NavLogo } from "./nav-logo";

const NAV = [
  { name: "Work", href: "/work" },
  { name: "Journey", href: "/journey" },
  { name: "Stack", href: "/skills" },
  { name: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Hide while scrolling down, return on any upward scroll.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className="fixed inset-x-0 top-0 z-50 transition-transform duration-[450ms]"
      style={{
        transform: hidden && !open ? "translateY(-100%)" : "none",
        transitionTimingFunction: "var(--ease-out)",
        viewTransitionName: "site-header",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink via-ink/70 to-transparent" />
      <div className="shell relative flex h-20 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Sandeep Paidipati, home">
          <NavLogo className="block h-9 w-10 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Sandeep Paidipati</span>
            <span className="t-mono text-[10px]!">AI Solutions Engineer</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <RollLink
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.name}
            </RollLink>
          ))}
        </nav>

        <button
          type="button"
          className="t-mono text-bone! relative z-10 -mr-2 px-2 py-3 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id="mobile-menu"
        className="fixed inset-0 -z-0 flex flex-col justify-end bg-ink md:hidden"
        style={{
          visibility: open ? "visible" : "hidden",
          opacity: open ? 1 : 0,
          transition: `opacity var(--t-ui) ${open ? "var(--ease-out)" : "var(--ease-in)"}, visibility 0s ${open ? "0s" : "var(--t-ui)"}`,
        }}
      >
        <nav aria-label="Mobile" className="shell flex flex-col pb-16">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="t-display-2 border-t border-rule py-4 hover:text-ember focus-visible:text-ember"
              style={{
                transform: open ? "none" : "translateY(24px)",
                opacity: open ? 1 : 0,
                transition: `transform 600ms var(--ease-out) ${open ? i * 40 + 60 : 0}ms, opacity 400ms var(--ease-out) ${open ? i * 40 + 60 : 0}ms`,
              }}
            >
              {item.name}
            </Link>
          ))}
          <p className="t-mono mt-8">sandeep.paidipati@gmail.com</p>
        </nav>
      </div>
    </header>
  );
}
