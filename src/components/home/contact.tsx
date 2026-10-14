"use client";

import { useState } from "react";
import { RevealText } from "@/components/motion/reveal";
import { RollLink } from "@/components/ui/roll-link";

const EMAIL = "sandeep.paidipati@gmail.com";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section id="contact" data-scene="contact" className="section shell grid-12 min-h-svh content-center gap-y-12">
      <p className="t-mono col-span-12">Contact</p>
      <RevealText as="h2" className="t-display-1 col-span-12 md:col-span-9">
        Let&apos;s build something useful.
      </RevealText>
      <p className="t-lead col-span-12 text-ash md:col-span-6">
        I&apos;m open to AI engineering roles and to consulting on retrieval, agents and evaluation. Email is the
        fastest way to reach me.
      </p>
      <div className="col-span-12 flex flex-col gap-6 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
        <RollLink href={`mailto:${EMAIL}`} className="text-[clamp(1.25rem,3vw,2.25rem)] font-medium tracking-[-0.03em]">
          {EMAIL}
        </RollLink>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copy} className="btn" aria-live="polite">
            {copied ? "Copied" : "Copy email"}
          </button>
          <a className="btn btn-ghost" href="https://www.linkedin.com/in/sandy-sp/" target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </div>
    </section>
  );
}
