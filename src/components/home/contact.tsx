"use client";

import { useState } from "react";
import { RevealText } from "@/components/motion/reveal";

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
      <div className="col-span-12 flex flex-wrap gap-3 border-t border-rule pt-8">
        <a className="btn" href={`mailto:${EMAIL}`}>
          Email me <span aria-hidden="true">→</span>
        </a>
        <button type="button" onClick={copy} className="btn btn-ghost" aria-live="polite">
          {copied ? "Address copied" : "Copy email address"}
        </button>
        <a className="btn btn-ghost" href="https://www.linkedin.com/in/sandy-sp/" target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
        <a className="btn btn-ghost" href="https://github.com/sandy-sp" target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      </div>
    </section>
  );
}
