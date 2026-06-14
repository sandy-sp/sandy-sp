"use client";

import { useEffect, useState } from "react";

import { NavLogo } from "@/components/nav-logo";

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type SocialLink = { label: string; href: string };

const LINKS: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sandy-sp/" },
  { label: "GitHub", href: "https://github.com/sandy-sp" },
  { label: "Email", href: "mailto:sandeep.paidipati@gmail.com" },
];

// Phase 3 (P 0.66 -> 1): the SOCIAL particle text forms in the canvas; this contact
// card reveals beneath it.
export function HomeSocial() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      setProgress(detail?.progress ?? 0);
    };

    window.addEventListener("home-scroll", handle);

    return () => window.removeEventListener("home-scroll", handle);
  }, []);

  const reveal = smoothstep(0.74, 0.9, progress);
  const visible = progress > 0.68;

  return (
    <div className="home-social" style={{ visibility: visible ? "visible" : "hidden" }}>
      <h2 className="sr-only">Social</h2>
      <div
        className="home-social__grid"
        style={{
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 1.6}rem)`,
          pointerEvents: reveal > 0.5 ? "auto" : "none",
        }}
      >
        <div className="home-social__box">
          <p className="home-social__lead">
            <span className="home-social__muted">And that&rsquo;s all,</span>
            <br />
            <span className="home-social__muted">folks</span>{" "}
            <span className="home-social__face">ツ</span> if you wanna work
            <br />
            together or just say hi, hit me up
          </p>
          <div className="home-social__buttons">
            {LINKS.map((link) => (
              <a
                key={link.label}
                className="home-social__btn"
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              >
                {link.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
        <div className="home-social__aside">
          <div className="home-social__logo">
            <NavLogo className="block h-20 w-20 sm:h-28 sm:w-28" />
          </div>
          <p className="home-social__footer">2025 — Site built by me :)</p>
        </div>
      </div>
    </div>
  );
}
