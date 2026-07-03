"use client";

import dynamic from "next/dynamic";

import { useMe } from "@/features/auth/api/use-me";
import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";
import { usePlanetData } from "../api/use-planet-data";
import { usePlanetStore } from "../stores/planet-store";
import { OnboardingStats } from "./onboarding-stats";
import { PlanetLoadingOverlay } from "./planet-loading-overlay";

const PlanetCanvas = dynamic(
  () =>
    import("./planet-canvas").then((mod) => ({
      default: mod.PlanetCanvas,
    })),
  { ssr: false },
);

export function PlanetCanvasWrapper() {
  const { isPending } = usePlanetData();
  const { data: me, isLoading: meLoading } = useMe();
  const introPhase = usePlanetStore((s) => s.introPhase);

  const isGuest = !meLoading && !me;
  const showOverlay = isGuest && (introPhase === "text" || introPhase === "done");

  return (
    <div className="relative h-full w-full">
      <PlanetLoadingOverlay isLoading={isPending} />

      {/* 3D Canvas — full screen */}
      <div className="h-full w-full">
        <PlanetCanvas />
      </div>
      <OnboardingStats />

      {/* Cinematic intro overlay for non-authenticated visitors */}
      {isGuest && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-40 flex flex-col items-center gap-5 transition-opacity duration-700"
          style={{ opacity: showOverlay ? 1 : 0 }}
        >
          <div className="pointer-events-auto">
            <GitHubSignInButton variant="primary">
              Claim our developer territory
            </GitHubSignInButton>
          </div>
        </div>
      )}
    </div>
  );
}
