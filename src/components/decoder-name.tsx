"use client";

import { useEffect, useRef, useState } from "react";

const words = ["Sandeep", "Sandy", "Sandy-SP"];
const subtitleLines = ["// Agentic AI & Gen AI Application Developer"];
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_-+=[]{}|;:,.<>?";
const nameHoldDuration = 3200;

export function DecoderName() {
  const textRef = useRef<HTMLSpanElement>(null);
  const subtitleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [isSphereReady, setIsSphereReady] = useState(false);
  const [activeSubtitleLine, setActiveSubtitleLine] = useState<number | null>(null);

  useEffect(() => {
    const handleSpinStart = () => {
      setIsSphereReady(true);
    };

    window.addEventListener("sphere-spin-start", handleSpinStart, { once: true });

    return () => {
      window.removeEventListener("sphere-spin-start", handleSpinStart);
    };
  }, []);

  useEffect(() => {
    if (!isSphereReady) {
      return;
    }

    const textElement = textRef.current;

    if (!textElement) {
      return;
    }

    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sleep = (duration: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, duration);
      });

    const renderText = (value: string) => {
      textElement.replaceChildren();

      for (const char of value) {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00a0" : char;
        textElement.appendChild(span);
      }
    };

    const renderLine = (element: HTMLSpanElement, value: string) => {
      element.textContent = value;
    };

    const scrambleNextCharacter = async (prefix: string, finalChar: string) => {
      if (reducedMotion.matches || finalChar === " ") {
        renderText(prefix + finalChar);
        await sleep(55);
        return;
      }

      const startedAt = performance.now();
      const duration = 280;

      while (!cancelled && performance.now() - startedAt < duration) {
        const randomIndex = Math.floor(Math.random() * scrambleChars.length);
        renderText(prefix + scrambleChars[randomIndex]);
        await sleep(32);
      }

      renderText(prefix + finalChar);
      await sleep(62);
    };

    const typeWord = async (word: string) => {
      let current = "";

      for (const char of word) {
        await scrambleNextCharacter(current, char);
        current += char;

        if (cancelled) {
          return current;
        }
      }

      return current;
    };

    const deleteWord = async (word: string) => {
      let current = word;

      while (current.length > 0 && !cancelled) {
        current = current.slice(0, -1);
        renderText(current);
        await sleep(reducedMotion.matches ? 80 : 95);
      }

      return current;
    };

    const run = async () => {
      let currentWord = "";

      renderText("");
      setActiveSubtitleLine(null);

      for (const element of subtitleRefs.current) {
        if (element) {
          renderLine(element, "");
        }
      }

      await sleep(reducedMotion.matches ? 160 : 520);

      currentWord = await typeWord(words[0]);

      if (cancelled) {
        return;
      }

      await sleep(reducedMotion.matches ? 180 : 420);

      for (let lineIndex = 0; lineIndex < subtitleLines.length; lineIndex += 1) {
        const element = subtitleRefs.current[lineIndex];
        const line = subtitleLines[lineIndex];

        if (!element) {
          continue;
        }

        let current = "";
        setActiveSubtitleLine(lineIndex);
        await sleep(reducedMotion.matches ? 40 : 160);

        for (const char of line) {
          if (cancelled) {
            return;
          }

          current += char;
          renderLine(element, current);
          await sleep(reducedMotion.matches ? 8 : 26);
        }

        await sleep(reducedMotion.matches ? 60 : 180);
      }

      setActiveSubtitleLine(null);
      await sleep(reducedMotion.matches ? 360 : 760);

      let wordIndex = 1;

      while (!cancelled) {
        await deleteWord(currentWord);
        await sleep(240);

        currentWord = await typeWord(words[wordIndex]);

        if (cancelled) {
          return;
        }

        await sleep(reducedMotion.matches ? 1800 : nameHoldDuration);
        wordIndex = (wordIndex + 1) % words.length;
      }
    };

    void run();

    return () => {
      cancelled = true;
      setActiveSubtitleLine(null);
    };
  }, [isSphereReady]);

  return (
    <div className={`decoder-name${isSphereReady ? " decoder-name--ready" : ""}`} aria-label="Sandeep, Sandy, Sandy-SP">
      {isSphereReady ? (
        <>
          <h1 className="decoder-name__text">
            <span className="decoder-name__prompt" aria-hidden="true">
              #
            </span>
            <span className="decoder-name__output" ref={textRef} />
            <span className="decoder-name__cursor" aria-hidden="true" />
          </h1>
          <div className="decoder-name__subtitle">
            {subtitleLines.map((line, index) => (
              <p key={line}>
                <span
                  className={`decoder-name__subtitle-output${
                    activeSubtitleLine === index ? " decoder-name__subtitle-output--active" : ""
                  }`}
                  ref={(node) => {
                    subtitleRefs.current[index] = node;
                  }}
                />
              </p>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
