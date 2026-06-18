"use client";

import { useEffect, useState } from "react";

import { NavLogo } from "@/components/shared/nav-logo";
import { revealStyle, smoothstep } from "@/lib/scroll-motion";

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

  const visible = progress > 0.72;
  const overall = smoothstep(0.82, 0.94, progress);
  // Staggered child windows so the card assembles piece by piece.
  const leadStyle = revealStyle(smoothstep(0.82, 0.9, progress));
  const asideStyle = revealStyle(smoothstep(0.86, 0.96, progress));

  return (
    <div className="home-social" style={{ visibility: visible ? "visible" : "hidden" }}>
      <h2 className="sr-only">Social</h2>
      <div
        className="home-social__grid"
        style={{ pointerEvents: overall > 0.5 ? "auto" : "none" }}
      >
        <div className="home-social__box">
          <p className="home-social__lead" style={leadStyle}>
            <span className="home-social__muted">And that&rsquo;s all,</span>
            <br />
            <span className="home-social__muted">folks</span>{" "}
            <span className="home-social__face">ツ</span> if you wanna work
            <br />
            together or just say hi, hit me up
          </p>
          <div className="home-social__buttons">
            {LINKS.map((link, i) => (
              <a
                key={link.label}
                className="home-social__btn"
                style={revealStyle(smoothstep(0.86 + i * 0.03, 0.94 + i * 0.03, progress))}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              >
                {link.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
        <div className="home-social__aside" style={asideStyle}>
          <div className="home-social__logo">
            <NavLogo className="block h-20 w-20 sm:h-28 sm:w-28" />
          </div>
          <p className="home-social__footer">2025 — Site built by me :)</p>
        </div>
      </div>
    </div>
  );
}
