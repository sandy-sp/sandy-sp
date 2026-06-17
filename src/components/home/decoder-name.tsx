"use client";

import { useEffect, useRef, useState } from "react";

const words = ["Sandeep", "Sandy", "Sandy-SP"];
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_-+=[]{}|;:,.<>?";
const nameHoldDuration = 5500;

export function DecoderName() {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isSphereReady, setIsSphereReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isScrollDismissed, setIsScrollDismissed] = useState(false);
  const [promptHidden, setPromptHidden] = useState(false);

  useEffect(() => {
    const handleSpinStart = () => {
      setIsSphereReady(true);
    };

    const handleEarthMorph = () => {
      setIsExiting(true);
    };

    // Canvas persists across navigations; reveal on the next frame if it already spun up.
    let frame = 0;

    if ((window as typeof window & { __sphereSpun?: boolean }).__sphereSpun) {
      frame = window.requestAnimationFrame(handleSpinStart);
    }

    window.addEventListener("sphere-spin-start", handleSpinStart, { once: true });
    window.addEventListener("sphere-morph-earth", handleEarthMorph, { once: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("sphere-spin-start", handleSpinStart);
      window.removeEventListener("sphere-morph-earth", handleEarthMorph);
    };
  }, []);

  // Scroll on the home page deletes the name; below the threshold it types again.
  useEffect(() => {
    const handleHomeScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;
      setIsScrollDismissed(Boolean(detail) && detail.progress > 0.02);
    };

    window.addEventListener("home-scroll", handleHomeScroll);

    return () => window.removeEventListener("home-scroll", handleHomeScroll);
  }, []);

  useEffect(() => {
    if (!isSphereReady || isExiting || isScrollDismissed) {
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

    const scrambleNextCharacter = async (prefix: string, finalChar: string) => {
      if (reducedMotion.matches || finalChar === " ") {
        if (!cancelled) {
          renderText(prefix + finalChar);
        }
        await sleep(55);
        return;
      }

      const startedAt = performance.now();
      const duration = 480;

      while (!cancelled && performance.now() - startedAt < duration) {
        const randomIndex = Math.floor(Math.random() * scrambleChars.length);
        renderText(prefix + scrambleChars[randomIndex]);
        await sleep(58);
      }

      // Only commit the settled character if we weren't cancelled mid-scramble —
      // otherwise this would re-write a char after the scroll-dismiss delete cleared it.
      if (!cancelled) {
        renderText(prefix + finalChar);
        await sleep(90);
      }
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
        await sleep(reducedMotion.matches ? 90 : 120);
      }

      return current;
    };

    const run = async () => {
      let currentWord = "";

      renderText("");

      // Wait for the nav to drop and the decoder to slide in from the left before typing.
      await sleep(reducedMotion.matches ? 200 : 1150);

      currentWord = await typeWord(words[0]);

      if (cancelled) {
        return;
      }

      // Hold the first name on screen the full duration before cycling.
      await sleep(reducedMotion.matches ? 1800 : nameHoldDuration);

      let wordIndex = 1;

      while (!cancelled) {
        await deleteWord(currentWord);
        await sleep(380);

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
    };
  }, [isSphereReady, isExiting, isScrollDismissed]);

  // On scroll-dismiss, delete the current text character by character, then hide the #.
  // Restores the prompt when scrolled back up (the typing effect re-runs).
  useEffect(() => {
    if (!isSphereReady || isExiting) {
      return;
    }

    if (!isScrollDismissed) {
      const id = window.requestAnimationFrame(() => setPromptHidden(false));
      return () => window.cancelAnimationFrame(id);
    }

    const textElement = textRef.current;

    if (!textElement) {
      return;
    }

    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sleep = (duration: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, duration));

    const run = async () => {
      let text = textElement.textContent ?? "";

      if (reduced) {
        textElement.textContent = "";
        setPromptHidden(true);
        return;
      }

      while (text.length > 0 && !cancelled) {
        text = text.slice(0, -1);
        textElement.textContent = text;
        await sleep(85);
      }

      if (!cancelled) {
        await sleep(160);
        setPromptHidden(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isScrollDismissed, isSphereReady, isExiting]);

  return (
    <div
      className={`decoder-name${isSphereReady ? " decoder-name--ready" : ""}${isExiting ? " decoder-name--exit" : ""}`}
      aria-label="Sandeep, Sandy, Sandy-SP"
    >
      {isSphereReady ? (
        <>
          <h1 className={`decoder-name__text${promptHidden ? " decoder-name__text--bare" : ""}`}>
            <span className="decoder-name__prompt" aria-hidden="true">
              #
            </span>
            <span className="decoder-name__output" ref={textRef} />
            <span className="decoder-name__cursor" aria-hidden="true" />
          </h1>
        </>
      ) : null}
    </div>
  );
}
