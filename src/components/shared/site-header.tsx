"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon, Sparkles, Search, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./icons";
import { useTheme } from "./theme-provider";
import { NavLogo } from "./nav-logo";

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Projects", href: "/open-source-projects", id: "nav-link-projects" },
    { name: "Journey", href: "/journey", id: "nav-link-journey" },
    { name: "Skills", href: "/skills", id: "nav-link-skills" },
  ];

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="relative flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-red-950/10 transition-all duration-300">
        {/* Brand 3D Interactive Logo & Role */}
        <Link
          href="/"
          id="brand-logo-link"
          className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl px-1.5 py-1 -ml-1 hover:bg-neutral-100/70 dark:hover:bg-white/5 transition-all"
          aria-label="Home - AI Solutions Specialist"
        >
          <NavLogo className="block h-8 w-11 shrink-0" />
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors uppercase">
            AI Solutions Specialist
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100/80 dark:bg-white/5 p-1 rounded-xl border border-neutral-200/80 dark:border-white/5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.id}
                id={link.id}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-red-700 dark:text-red-400 bg-white dark:bg-white/10 shadow-sm border border-neutral-200/60 dark:border-transparent font-semibold"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons, Search & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger */}
          <button
            id="header-cmd-palette-btn"
            onClick={openCommandPalette}
            type="button"
            aria-label="Open command palette (Cmd+K)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 hover:bg-neutral-100/70 dark:hover:bg-white/5 text-xs font-mono transition-all"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline font-semibold">⌘K</span>
          </button>

          {/* Social & Contact Links */}
          <a
            id="header-email-link"
            href="mailto:sandeep.paidipati@gmail.com"
            aria-label="Email Sandy"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            id="header-github-link"
            href="https://github.com/sandy-sp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            id="header-linkedin-link"
            href="https://www.linkedin.com/in/sandy-sp/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          {/* Theme Toggle */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggle}
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:border-red-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-red-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden mt-2 p-4 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0e0f14]/95 backdrop-blur-2xl shadow-xl flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-top-2"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.id}
                id={`mobile-${link.id}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-red-500/10 text-red-700 dark:text-red-400 font-semibold"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{link.name}</span>
                {active && <Sparkles className="w-3.5 h-3.5 text-red-500" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
