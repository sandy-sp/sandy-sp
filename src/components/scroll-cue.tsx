"use client";

import { useEffect, useState } from "react";

export function ScrollCue() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleEarthLocked = () => {
      setIsVisible(true);
    };

    // Retire the cue once the user actually starts scrolling into the zoom.
    const handleZoom = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number }>).detail;

      if (detail && detail.progress > 0.04) {
        setIsDismissed(true);
      }
    };

    window.addEventListener("earth-rotation-locked", handleEarthLocked, { once: true });
    window.addEventListener("earth-zoom", handleZoom);

    return () => {
      window.removeEventListener("earth-rotation-locked", handleEarthLocked);
      window.removeEventListener("earth-zoom", handleZoom);
    };
  }, []);

  const show = isVisible && !isDismissed;

  return (
    <div className={`scroll-cue${show ? " scroll-cue--visible" : ""}`} aria-hidden={!show}>
      {"[ ↓ SCROLL TO ENTER BIOGRAPHY ]"}
    </div>
  );
}
