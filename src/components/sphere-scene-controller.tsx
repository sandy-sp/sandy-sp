"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The particle canvas lives in the root layout and persists across navigations.
// This controller tells it which scene the current route wants, so the canvas
// transitions in place instead of remounting (no blank flash, no replayed intro).
export function SphereSceneController() {
  const pathname = usePathname();

  useEffect(() => {
    const scene = pathname === "/about" ? "about" : "home";
    window.dispatchEvent(new CustomEvent("sphere-scene", { detail: { scene } }));

    // View Work has its own WebGL background; hide the persistent particle canvas there
    // so two backgrounds never stack.
    document.documentElement.classList.toggle(
      "route-work",
      pathname.startsWith("/open-source-projects"),
    );
  }, [pathname]);

  return null;
}
