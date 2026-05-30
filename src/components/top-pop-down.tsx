"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

const primaryLinks = [
  { href: "/about", label: "About Me" },
  { href: "/", label: "Home" },
  { href: "/open-source-projects", label: "Projects" },
];

const socialLinks = [
  { href: "mailto:sandeep.paidipati@gmail.com", label: "Email" },
  { href: "https://linkedin.com/in/sandy-sp", label: "LinkedIN" },
  { href: "https://github.com/sandy-sp", label: "GitHub" },
];

export function TopPopDown() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setVisible(window.scrollY < 24);
    }, 1200);

    const onScroll = () => {
      setVisible(window.scrollY < 24);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const bentoStyle = useMemo<CSSProperties>(
    () => ({
      alignItems: "center",
      background: "var(--surface)",
      border: "1px solid var(--pill-border)",
      borderRadius: "0.95rem",
      boxShadow:
        "0 18px 54px rgba(153, 51, 51, 0.22), 0 0 0 1px rgba(153, 51, 51, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.52)",
      color: "var(--foreground)",
      display: "inline-flex",
      gap: "0.35rem",
      minHeight: "2.4rem",
      padding: "0.3rem 0.6rem",
      textDecoration: "none",
      backdropFilter: "blur(18px) saturate(1.2)",
      WebkitBackdropFilter: "blur(18px) saturate(1.2)",
    }),
    [],
  );

  const floatingStyle = useMemo<CSSProperties>(
    () => ({
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      position: "fixed",
      top: "clamp(0.75rem, 2vw, 1.15rem)",
      transition: "opacity 0.48s ease, transform 0.58s cubic-bezier(0.22, 1, 0.36, 1)",
      zIndex: 70,
    }),
    [visible],
  );

  const linkStyle = (isActive = false): CSSProperties => ({
    background: isActive ? "var(--surface-strong)" : "transparent",
    borderRadius: "0.68rem",
    color: "var(--foreground)",
    fontSize: "0.85rem",
    opacity: isActive ? 1 : 0.78,
    padding: "0.34rem 0.72rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  });

  const dividerStyle: CSSProperties = {
    background: "var(--pill-border)",
    display: "inline-block",
    height: "0.85rem",
    width: "1px",
  };

  return (
    <>
      <Link
        href="/"
        style={{
          ...floatingStyle,
          ...bentoStyle,
          fontWeight: 700,
          gap: "0.18rem",
          left: "clamp(1rem, 3vw, 2.5rem)",
          padding: "0.3rem 0.95rem",
          textShadow: "var(--brand-shadow)",
          transform: visible ? "translateY(0)" : "translateY(-1.5rem)",
        }}
      >
        Sandy
        <span style={{ color: "var(--accent)", fontWeight: 800 }} aria-hidden="true">
          -
        </span>
        SP
      </Link>

      <nav
        aria-label="Primary navigation"
        style={{
          ...floatingStyle,
          ...bentoStyle,
          left: "50%",
          transform: visible ? "translate(-50%, 0)" : "translate(-50%, -1.5rem)",
        }}
      >
        {primaryLinks.map((link) => (
          <Link key={link.href} href={link.href} style={linkStyle(pathname === link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>

      <nav
        aria-label="Social links"
        style={{
          ...floatingStyle,
          ...bentoStyle,
          right: "clamp(1rem, 3vw, 2.5rem)",
          transform: visible ? "translateY(0)" : "translateY(-1.5rem)",
        }}
      >
        {socialLinks.map((link, index) => (
          <span key={link.label} style={{ alignItems: "center", display: "inline-flex", gap: "0.5rem" }}>
            <a
              href={link.href}
              rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
              style={linkStyle()}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            >
              {link.label}
            </a>
            {index < socialLinks.length - 1 ? <span style={dividerStyle} aria-hidden="true" /> : null}
          </span>
        ))}
      </nav>
    </>
  );
}
