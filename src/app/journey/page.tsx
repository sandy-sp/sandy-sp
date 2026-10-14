"use client";

import { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  Mail,
  ArrowUpRight,
  Compass,
} from "lucide-react";
import { EXPERIENCES } from "@/data/experience";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

export default function JourneyPage() {
  const [filterType, setFilterType] = useState<"all" | "ai-enterprise" | "software-engineering" | "education">("all");

  const filteredExperiences =
    filterType === "all" ? EXPERIENCES : EXPERIENCES.filter((e) => e.type === filterType);

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      {/* Intro Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>{"// CAREER CHRONOLOGY & PROFESSIONAL JOURNEY"}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight mb-6">
          Systems Engineering, Psychology &amp; Artificial Intelligence
        </h1>
        <div className="space-y-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
          <p>
            Hey, I&apos;m <strong className="text-neutral-900 dark:text-white font-semibold">Sandy</strong>. With 9+ years across software engineering and a Master of Information Systems from Cleveland State University (Ahuja Endowment Scholar), I design and deploy production-grade Generative AI, RAG pipelines, and autonomous multi-agent systems.
          </p>
          <p>
            My engineering foundation is built on a unique intersection: <strong className="text-neutral-900 dark:text-white font-semibold">Electrical &amp; Electronics Engineering</strong> (computational logic &amp; systems theory), <strong className="text-neutral-900 dark:text-white font-semibold">Psychology</strong> (mental models &amp; human behavior), and <strong className="text-neutral-900 dark:text-white font-semibold">Information Systems</strong> (enterprise data governance &amp; scalability). This multidisciplinary perspective is critical when building agentic AI that collaborates effectively with human operators.
          </p>
          <p>
            Currently, I serve as an <strong className="text-neutral-900 dark:text-white font-semibold">AI Automation Engineer &amp; Solutions Architect at OrbisQ Inc</strong>, building enterprise multi-agent pipelines with Azure OpenAI and AWS Bedrock, while publishing open-source developer tools on PyPI.
          </p>
        </div>
      </div>

      {/* Key Milestones Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md mb-16 shadow-sm">
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">9+ Years</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Systems &amp; Software</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-red-700 dark:text-red-400">Ahuja Scholar</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">CSU Master of Info Systems</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">Enterprise AI</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">OrbisQ Inc Architect</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">3 Disciplines</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Engineering, Psych &amp; MIS</span>
        </div>
      </div>

      {/* Career Timeline Section */}
      <section className="mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Professional Timeline &amp; Experience
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              From enterprise AI architect and open source author to software developer and university training.
            </p>
          </div>

          {/* Timeline Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 text-xs">
            <button
              id="timeline-filter-all"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              All ({EXPERIENCES.length})
            </button>
            <button
              id="timeline-filter-ai"
              onClick={() => setFilterType("ai-enterprise")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "ai-enterprise"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              AI &amp; Enterprise (4)
            </button>
            <button
              id="timeline-filter-engineering"
              onClick={() => setFilterType("software-engineering")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "software-engineering"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Software Eng (3)
            </button>
            <button
              id="timeline-filter-education"
              onClick={() => setFilterType("education")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "education"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Education (3)
            </button>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-neutral-200 dark:border-white/10 space-y-12">
          {filteredExperiences.map((exp) => {
            const isEdu = exp.type === "education";
            return (
              <div key={exp.id} className="relative group">
                {/* Node Pip */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-red-500 bg-white dark:bg-[#0e0f14] group-hover:scale-125 group-hover:bg-red-500 transition-all shadow-md shadow-red-500/20" />

                <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/85 backdrop-blur-md hover:border-red-500/40 hover:shadow-xl hover:shadow-red-950/5 transition-all shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="p-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-400">
                          {isEdu ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                        </span>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {exp.role}
                        </h3>
                        {exp.current && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {exp.company}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 mb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    {exp.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-neutral-100 dark:border-white/5">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <div className="p-8 rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/8 via-white/80 dark:via-[#0e0f14]/90 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
            Interested in collaborating or discussing an AI engineering role?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Reach out via email or LinkedIn — open to technical advisory, AI architecture, and engineering roles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            id="journey-cta-email-btn"
            href="mailto:sandeep.paidipati@gmail.com?subject=Connecting%20with%20Sandy"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-md shadow-red-600/20 hover:shadow-lg transition-all"
            aria-label="Send Email"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </a>
          <a
            id="journey-cta-linkedin-btn"
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
            id="journey-cta-github-btn"
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
