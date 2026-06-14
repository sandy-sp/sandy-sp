"use client";

import { HomeNavOverlay } from "@/components/home-nav-overlay";
import { ScrollCue } from "@/components/scroll-cue";
import { TimelineStage } from "@/components/timeline-stage";

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
