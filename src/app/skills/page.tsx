"use client";

import { useState } from "react";
import {
  Sparkles,
  Bot,
  Server,
  Cloud,
  Layout,
  CheckCircle2,
  Mail,
  Award,
  ArrowUpRight,
  Cpu,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { SKILL_CATEGORIES, CERTIFICATIONS } from "@/data/experience";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

export default function SkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getIconForCategory = (icon: string) => {
    switch (icon) {
      case "Bot":
        return <Bot className="w-5 h-5 text-red-500" />;
      case "Server":
        return <Server className="w-5 h-5 text-rose-500" />;
      case "Cloud":
        return <Cloud className="w-5 h-5 text-red-600" />;
      default:
        return <Layout className="w-5 h-5 text-red-500" />;
    }
  };

  const filteredCategories =
    selectedCategory === "all"
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((c) => c.title.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      {/* Intro Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>{"// TECHNICAL ARSENAL & SKILLS TAXONOMY"}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4">
          Technical Competencies &amp; Architectural Taxonomy
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
          A structured breakdown of autonomous agent frameworks, distributed backend architectures, cloud MLOps, and frontend design systems engineered by Sandy across 9+ years of production delivery.
        </p>
      </div>

      {/* Official Certifications & Credentials Grid */}
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-red-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Certifications &amp; Official Credentials
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.title}
              className="p-5 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md shadow-sm hover:border-red-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {cert.category}
                </span>
                {cert.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 font-semibold border border-red-500/20">
                    {cert.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                {cert.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {cert.issuer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills & Tech Taxonomy Section */}
      <section className="mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Core Domains &amp; Proficiency Taxonomy
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Tools, frameworks, and architectural paradigms mastered across 9+ years of engineering.
            </p>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 text-xs">
            <button
              id="skill-filter-all"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              All Domains
            </button>
            <button
              id="skill-filter-ai"
              onClick={() => setSelectedCategory("Generative AI")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "Generative AI"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              AI &amp; Agents
            </button>
            <button
              id="skill-filter-backend"
              onClick={() => setSelectedCategory("Backend")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "Backend"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Backend &amp; Systems
            </button>
            <button
              id="skill-filter-cloud"
              onClick={() => setSelectedCategory("Cloud")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "Cloud"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Cloud &amp; MLOps
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.title}
              className="p-6 sm:p-7 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md hover:border-red-500/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5">
                  {getIconForCategory(category.icon)}
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {category.skills.map((skill, sIdx) => (
                  <li
                    key={sIdx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Pillars Strip */}
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-red-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Architectural Tenets &amp; Delivery Principles
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md">
            <div className="p-2 w-fit rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
              Zero-Hallucination Guardrails
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every production agent is constrained with strict Pydantic schemas, Chain-of-Thought validation, and automated Ragas hallucination benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md">
            <div className="p-2 w-fit rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
              Hardware-Aware AI Profiling
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Matching quantization algorithms (Q4_K_M, Q8_0) directly with available GPU VRAM and memory bandwidth to eliminate OOM runtime failures.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md">
            <div className="p-2 w-fit rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
              High-Signal Context Density
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Pruning irrelevant metadata, stripping binary clutter, and optimizing context windows to maximize LLM reasoning bandwidth.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <div className="p-8 rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/8 via-white/80 dark:via-[#0e0f14]/90 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
            Need deep technical execution or architectural leadership?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Reach out via email or LinkedIn — open to technical advisory, AI architecture, and engineering roles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            id="skills-cta-email-btn"
            href="mailto:sandeep.paidipati@gmail.com?subject=Technical%20Inquiry%20for%20Sandy"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-md shadow-red-600/20 hover:shadow-lg transition-all"
            aria-label="Send Email"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
          <a
            id="skills-cta-linkedin-btn"
            href="https://www.linkedin.com/in/sandy-sp/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 font-medium text-sm transition-all shadow-sm"
            aria-label="LinkedIn Profile"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </a>
          <a
            id="skills-cta-github-btn"
            href="https://github.com/sandy-sp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 font-medium text-sm transition-all shadow-sm"
            aria-label="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
