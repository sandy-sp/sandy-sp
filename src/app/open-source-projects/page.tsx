"use client";

import { useState } from "react";
import { ExternalLink, Sparkles, Search, Terminal, Check, Copy } from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";
import { PROJECTS } from "@/data/projects";
import { SpotlightCard } from "@/components/shared/spotlight-card";

type CategoryFilter = "All" | "AI & LLM" | "Developer Tools" | "Data & Analytics";

export default function OpenSourceProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories: CategoryFilter[] = ["All", "AI & LLM", "Developer Tools", "Data & Analytics"];

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const filteredProjects = PROJECTS.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>{"// OPEN SOURCE REPOSITORIES & PACKAGES"}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4">
          Engineered Tools & Open Repositories
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Production CLI utilities, PyPI packages, machine learning dataset engines, and privacy forensics tools built by Sandy to eliminate engineering bottlenecks.
        </p>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200/80 dark:border-white/10">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              id={`filter-btn-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20 font-semibold"
                  : "border border-neutral-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10"
              }`}
            >
              {category}
              <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                (
                {category === "All"
                  ? PROJECTS.length
                  : PROJECTS.filter((p) => p.category === category).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="projects-search-input"
            type="text"
            placeholder="Search by tech, name, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0e0f14]/80 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          />
        </div>
      </div>

      {/* Project Cards Grid with Cursor Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <SpotlightCard
            key={project.id}
            id={`project-card-${project.id}`}
            className="group flex flex-col justify-between p-6 sm:p-7 border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md hover:border-red-500/40 hover:shadow-xl hover:shadow-red-950/5 transition-all duration-300"
          >
            <div>
              {/* Top Pill & Category */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-medium">
                  {project.badge || project.category}
                </span>
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  {project.category}
                </span>
              </div>

              {/* Title & Tagline */}
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1">
                {project.title}
              </h2>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                {project.tagline}
              </p>

              {/* Description */}
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-5">
                {project.description}
              </p>

              {/* Install Command if available */}
              {project.installCommand && (
                <div className="mb-5">
                  <button
                    id={`catalog-copy-cmd-${project.id}`}
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

              {/* Key Capabilities */}
              <div className="space-y-1.5 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Key Capabilities
                </span>
                <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {project.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture Notes */}
              {project.architectureNotes && (
                <div className="p-2.5 rounded-lg border border-neutral-200/60 dark:border-white/5 bg-neutral-50 dark:bg-white/5 text-[11px] text-neutral-500 dark:text-neutral-400 mb-5 leading-normal">
                  <span className="text-red-700 dark:text-red-400 font-mono font-semibold">Arch:</span>{" "}
                  {project.architectureNotes}
                </div>
              )}
            </div>

            <div>
              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 mb-5 pt-3 border-t border-neutral-100 dark:border-white/5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-white/5"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  id={`catalog-gh-${project.id}`}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-mono font-medium transition-all"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                {project.demoUrl && (
                  <a
                    id={`catalog-demo-${project.id}`}
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-mono text-neutral-700 dark:text-neutral-200 hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Package</span>
                  </a>
                )}
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
          <p className="text-neutral-500 dark:text-neutral-400 font-mono text-sm">
            No projects matched your filter query &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
