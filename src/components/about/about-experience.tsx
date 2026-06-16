"use client";

import { HomeNavOverlay } from "@/components/shared/home-nav-overlay";
import { ScrollCue } from "@/components/about/scroll-cue";
import { TimelineStage } from "@/components/about/timeline-stage";

// The Earth morph is triggered by the route-aware SphereSceneController (the canvas
// lives in the layout and persists), so this page only mounts the overlays.
export function AboutExperience() {
  return (
    <main className="home-shell">
      <HomeNavOverlay />
      <ScrollCue />
      <TimelineStage />
    </main>
  );
}
