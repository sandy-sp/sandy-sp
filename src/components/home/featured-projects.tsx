"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, Terminal, Check, Copy } from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";
import { PROJECTS } from "@/data/projects";
import { SpotlightCard } from "@/components/shared/spotlight-card";

export function FeaturedProjects() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <section className="py-20 border-t border-neutral-200/80 dark:border-white/10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>{"// FLAGSHIP TOOLS"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Published Open Source Tools
            </h2>
          </div>
          <Link
            id="view-all-projects-top-link"
            href="/open-source-projects"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <span>Explore All 9 Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Project Cards Grid with Cursor Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((project, idx) => (
            <SpotlightCard
              key={project.id}
              id={`featured-card-${project.id}`}
              className="group flex flex-col justify-between p-6 sm:p-7 border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md hover:border-red-500/40 hover:shadow-xl hover:shadow-red-950/5 transition-all duration-300"
            >
              <div>
                {/* Index & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-neutral-400 dark:text-neutral-500">
                    {`0${idx + 1} //`}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-medium">
                    {project.badge || project.category}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors mb-1">
                  {project.title}
                </h3>
                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-1">
                  {project.tagline}
                </p>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Install Command if available */}
                {project.installCommand && (
                  <div className="mb-5">
                    <button
                      id={`copy-cmd-${project.id}`}
                      onClick={() => copyCommand(project.installCommand!)}
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100/70 dark:bg-white/5 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:border-red-500/40 transition-all"
                    >
                      <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                        <Terminal className="w-3.5 h-3.5 text-red-500" />
                        {project.installCommand}
                      </span>
                      {copiedCmd === project.installCommand ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div>
                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 mb-5 pt-4 border-t border-neutral-100 dark:border-white/5">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Source Link */}
                <div className="flex items-center gap-2">
                  <a
                    id={`project-gh-${project.id}`}
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:border-red-500/40 hover:text-red-700 dark:hover:text-red-400 transition-all"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>

        {/* Catalog Teaser Card */}
        <div className="mt-12 p-6 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-gradient-to-r from-red-500/8 via-rose-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">
              Looking for ChatAudit, LinkedIn Post Studio, YTGrid, or Metadata Cleaner?
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Browse all 9 production tools, privacy utilities, and data dashboards in the full project catalog.
            </p>
          </div>
          <Link
            id="featured-projects-browse-all-btn"
            href="/open-source-projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold transition-all shrink-0 shadow-sm"
          >
            <span>Open Catalog (9 Projects)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
