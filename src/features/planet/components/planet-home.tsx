"use client";

import dynamic from "next/dynamic";

import { useMe } from "@/features/auth/api/use-me";
import { GitHubSignInButton } from "@/features/auth/components/github-sign-in-button";
import { usePlanetData } from "../api/use-planet-data";
import { usePlanetStore } from "../stores/planet-store";

const PlanetCanvas = dynamic(
  () =>
    import("./planet-canvas").then((mod) => ({
      default: mod.PlanetCanvas,
    })),
  { ssr: false },
);

export function PlanetHome() {
  const { isPending } = usePlanetData();
  const { data: me, isLoading: meLoading } = useMe();
  const introPhase = usePlanetStore((s) => s.introPhase);

  const isGuest = !meLoading && !me;
  const showOverlay = isGuest && (introPhase === "text" || introPhase === "done");

  return (
    <div className="relative h-full w-full">
      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading planet…</p>
          </div>
        </div>
      )}

      {/* 3D Canvas — full screen */}
      <div className="h-full w-full">
        <PlanetCanvas />
      </div>

      {/* Cinematic intro overlay for non-authenticated visitors */}
      {isGuest && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 z-40 flex flex-col items-center gap-5 transition-opacity duration-700"
          style={{ opacity: showOverlay ? 1 : 0 }}
        >
          <div className="pointer-events-auto">
            <GitHubSignInButton>Claim our developer territory</GitHubSignInButton>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-40">
        <h1 className="text-lg font-semibold tracking-tight text-white/80">
          Devplanet
        </h1>
        <p className="text-sm text-zinc-500">A planet built by developers</p>
      </div>
    </div>
  );
}
