"use client";

import { useState } from "react";

/** Install command with copy-to-clipboard. Falls back to selecting the text. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const code = e.currentTarget.previousElementSibling;
      if (code) window.getSelection()?.selectAllChildren(code);
    }
  };

  return (
    <div className="flex items-stretch border border-rule">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-sm">
        <span className="select-none text-ash">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className="t-mono border-l border-rule px-4 transition-colors duration-[180ms] hover:text-ember"
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
