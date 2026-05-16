"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const featuredProjects = [
  {
    title: "Gittxt",
    description:
      "Open-source tool that transforms GitHub repositories into LLM-compatible datasets.",
  },
  {
    title: "AI Reply Index",
    description:
      "GitHub-based repository to log, organize, and share AI prompts and responses.",
  },
  {
    title: "Audionomy",
    description:
      "Audio dataset management app for metadata handling, visualization, and sharing.",
  },
  {
    title: "YTGrid",
    description:
      "Hybrid CLI + API architecture for scalable YouTube automation and real-time tracking.",
  },
  {
    title: "Metadata Cleaner",
    description:
      "CLI utility for viewing and removing metadata across images, docs, audio, and video.",
  },
];

const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
} satisfies Variants;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
} satisfies Variants;

export function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_right,#f8d7da_0%,#f4f4f5_35%,#ffffff_100%)] text-zinc-800">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(185,28,28,0.10),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(185,28,28,0.12),transparent_38%)]" />
      <div className="network-bg pointer-events-none absolute inset-0 -z-10 opacity-65" />

      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#" className="text-xl font-bold tracking-tight text-zinc-900">
            SP
          </a>
          <ul className="flex items-center gap-6 text-sm font-medium text-zinc-700">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-red-700 focus:text-red-700 focus:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-16 pt-14 md:pt-20">
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.p
            variants={item}
            className="inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-1 text-xs font-semibold tracking-[0.18em] text-red-700 uppercase"
          >
            AI Developer Portfolio
          </motion.p>
          <motion.h1
            variants={item}
            className="max-w-4xl text-4xl leading-tight font-bold tracking-tight text-zinc-900 md:text-6xl"
          >
            Sandeep Paidipati — building real-world AI products with LLMs and full-stack engineering.
          </motion.h1>
          <motion.p
            variants={item}
            className="max-w-3xl text-lg leading-relaxed text-zinc-600"
          >
            I design and ship production-minded AI solutions across Generative AI, LLM workflows,
            and web platforms with clean UX and scalable architecture.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-500"
            >
              Reach Out
            </a>
          </motion.div>
        </motion.section>

        <section id="about" className="grid gap-8 rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-sm md:grid-cols-3">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-red-700 uppercase md:col-span-1">
            About
          </h2>
          <p className="text-lg leading-relaxed text-zinc-700 md:col-span-2">
            I am an AI Solution Specialist and full-stack developer focused on bridging creativity
            and engineering. I enjoy solving complex problems, collaborating across teams, and
            building practical AI-powered products that users love.
          </p>
        </section>

        <section id="projects" className="space-y-6">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-red-700 uppercase">
            Open Source Projects
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-600">{project.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="experience" className="space-y-6">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-red-700 uppercase">
            Experience Highlights
          </h2>
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-base leading-8 text-zinc-700">
              AI Solution Specialist (2023–Present), Full Stack Developer at RubixQ (2020–2022),
              Web Designer at Einstein Brains Group (2018–2020), and Software Developer/Tester at
              Avico Software Solutions (2016–2018).
            </p>
          </div>
        </section>

        <section id="contact" className="space-y-4 border-t border-zinc-200 py-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Reach Out</h2>
          <p className="max-w-3xl text-lg leading-relaxed text-zinc-600">
            Please reach out if you want to collaborate, are hiring AI/Research Engineers, or just
            want to say hi.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm font-semibold">
            <a
              href="https://www.linkedin.com/in/sandeep-paidipati"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-800 transition hover:border-zinc-500"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/sandy-sp"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-800 transition hover:border-zinc-500"
            >
              GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
