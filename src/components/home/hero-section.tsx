"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy, Terminal, Mail } from "lucide-react";

export function HeroSection() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-start gap-8">
          {/* Status Pill */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Sandeep / Sandy</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              Architecting{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-400 dark:via-rose-300 dark:to-red-200">
                Autonomous AI Systems
              </span>{" "}
              & Production Pipelines.
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl font-normal leading-relaxed pt-2">
              With 9+ years across software engineering and a Master of Information Systems from Cleveland State University, I bridge theoretical generative AI into dependable enterprise software. Specializing in multi-agent orchestration, high-signal RAG architectures, and developer tooling.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              id="hero-cta-explore-work"
              href="/open-source-projects"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              id="hero-cta-career-journey"
              href="/journey"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-300/80 dark:border-white/15 bg-white/80 dark:bg-white/5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-white/10 font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
            >
              <span>Journey</span>
            </Link>

            <Link
              id="hero-cta-skills"
              href="/skills"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-300/80 dark:border-white/15 bg-white/80 dark:bg-white/5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-white/10 font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
            >
              <span>Skills</span>
            </Link>

            <a
              id="hero-cta-email-btn"
              href="mailto:sandeep.paidipati@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-300/80 dark:border-white/15 bg-white/80 dark:bg-white/5 text-neutral-900 dark:text-neutral-100 hover:border-red-500/40 hover:text-red-700 dark:hover:text-red-400 font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
              aria-label="Send Email"
            >
              <Mail className="w-4 h-4 text-red-500" />
              <span>Email</span>
            </a>
          </div>

          {/* Quick PyPI Install Badges */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <span className="text-neutral-400 dark:text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
              Live PyPI Tools:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="copy-pip-gittxt"
                onClick={() => copyCommand("pip install gittxt")}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-white/5 hover:border-red-500/40 text-neutral-800 dark:text-neutral-200 transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-red-500" />
                <span>pip install gittxt</span>
                {copiedCmd === "pip install gittxt" ? (
                  <Check className="w-3 h-3 text-emerald-500 ml-1" />
                ) : (
                  <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 ml-1" />
                )}
              </button>

              <button
                id="copy-pip-ollama-scout"
                onClick={() => copyCommand("pipx install ollama-scout")}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-white/5 hover:border-red-500/40 text-neutral-800 dark:text-neutral-200 transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-red-500" />
                <span>pipx install ollama-scout</span>
                {copiedCmd === "pipx install ollama-scout" ? (
                  <Check className="w-3 h-3 text-emerald-500 ml-1" />
                ) : (
                  <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Credential Ribbon */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 mt-6 border-t border-neutral-200/90 dark:border-white/10">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">9+ Years</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Software & Systems</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-red-700 dark:text-red-400">Ahuja Scholar</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">M.S. Info Systems &bull; CSU &apos;24</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">AI Architect</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">OrbisQ &bull; Multi-Agent RAG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">PyPI Author</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">9+ Open Source Packages</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
