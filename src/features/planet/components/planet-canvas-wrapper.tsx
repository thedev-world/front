"use client";

import dynamic from "next/dynamic";

import { usePlanetData } from "../api/use-planet-data";
import { PersonalTerritoryStats } from "./personal-territory-stats";
import { PlanetLoadingOverlay } from "./planet-loading-overlay";
import { WorldInteractionHint } from "./world-interaction-hint";

const PlanetCanvas = dynamic(
  () =>
    import("./planet-canvas").then((mod) => ({
      default: mod.PlanetCanvas,
    })),
  { ssr: false },
);

export function PlanetCanvasWrapper() {
  const { isPending } = usePlanetData();

  return (
    <div className="relative h-full w-full">
      <PlanetLoadingOverlay isLoading={isPending} />

      {/* 3D Canvas — full screen */}
      <div className="h-full w-full">
        <PlanetCanvas />
      </div>
      <PersonalTerritoryStats />
      <WorldInteractionHint />
    </div>
  );
}
