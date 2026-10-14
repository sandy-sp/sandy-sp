"use client";

import { Mail, ArrowUpRight, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

export function ContactSection() {
  const email = "sandeep.paidipati@gmail.com";

  return (
    <section className="py-20 border-t border-neutral-200/80 dark:border-white/10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative p-8 sm:p-12 rounded-3xl border border-red-500/25 bg-gradient-to-br from-red-500/8 via-white/80 dark:via-[#0e0f14]/90 to-transparent backdrop-blur-xl shadow-lg dark:shadow-2xl overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>{"// COLLABORATION & INQUIRIES"}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
              Let&apos;s Build Resilient AI Systems Together.
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Currently architecting enterprise AI solutions at OrbisQ Inc. Open to technical advisory, high-impact AI Solutions Specialist roles, and autonomous multi-agent engineering collaborations.
            </p>

            {/* Actions: Email, LinkedIn, GitHub */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                id="contact-email-btn"
                href={`mailto:${email}?subject=Connecting%20with%20Sandy`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Send Email"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                id="contact-linkedin-link"
                href="https://www.linkedin.com/in/sandy-sp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 font-medium text-sm transition-all shadow-sm"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </a>

              <a
                id="contact-github-link"
                href="https://github.com/sandy-sp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 font-medium text-sm transition-all shadow-sm"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
