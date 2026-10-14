"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./icons";

export function SiteFooter() {
  const email = "sandeep.paidipati@gmail.com";

  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-white/5 bg-neutral-50/50 dark:bg-[#07080c]/80 backdrop-blur-md mt-24 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Column: Brand & Status */}
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Available for AI Architecture & Roles
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Sandy — Architecting autonomous multi-agent pipelines, generative AI solutions, and full-stack systems.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-500">
            <span>Cleveland, OH</span>
            <span>•</span>
            <span>M.S. Info Systems</span>
          </div>
        </div>

        {/* Center: Quick Links */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Navigation
          </span>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link
              id="footer-link-home"
              href="/"
              className="text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Home
            </Link>
            <Link
              id="footer-link-projects"
              href="/open-source-projects"
              className="text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Projects
            </Link>
            <Link
              id="footer-link-journey"
              href="/journey"
              className="text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Journey
            </Link>
            <Link
              id="footer-link-skills"
              href="/skills"
              className="text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Skills
            </Link>
          </div>
        </div>

        {/* Right Column: Connect */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Connect
          </span>
          <div className="flex items-center gap-2">
            <a
              id="footer-email-btn"
              href={`mailto:${email}`}
              className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/30 transition-all"
              aria-label="Email Sandy"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              id="footer-linkedin-btn"
              href="https://www.linkedin.com/in/sandy-sp/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/30 transition-all"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a
              id="footer-github-btn"
              href="https://github.com/sandy-sp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/30 transition-all"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 font-mono">
            © {new Date().getFullYear()} Sandy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
