"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { StepIslandPicker } from "./step-island-picker";
import { StepGithubScan } from "./step-github-scan";
import { LevelReveal } from "./level-reveal";
import { useUpdateIsland } from "../api/use-update-island";
import { useCompleteOnboarding } from "../api/use-complete-onboarding";
import { usePlanetStore } from "@/features/planet/stores/planet-store";
import { usePlayerClasses } from "../api/use-player-classes";
import { usePreloadImages } from "@/hooks/use-preload-images";

type Step = "island" | "scan" | "reveal";

const TRANSITION_MS = 700;

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("island");
  const { data: playerClasses } = usePlayerClasses();

  usePreloadImages(playerClasses || [], (cls) => cls.badge);
  const [showScanLayer, setShowScanLayer] = useState(false);
  const [scanExit, setScanExit] = useState(false);
  const [showRevealLayer, setShowRevealLayer] = useState(false);
  const [revealEnter, setRevealEnter] = useState(false);
  const router = useRouter();
  const { mutate: updateIsland, isPending: isUpdatingIsland } =
    useUpdateIsland();
  const { mutate: completeOnboarding, isPending: isCompletingOnboarding } =
    useCompleteOnboarding();
  const setFromOnboarding = usePlanetStore((s) => s.setFromOnboarding);

  const isConfirming = isUpdatingIsland || isCompletingOnboarding;

  function handleConfirm(island: string) {
    updateIsland(island, {
      onSuccess: () => {
        completeOnboarding(undefined, {
          onSuccess: () => {
            setShowScanLayer(true);
            setScanExit(false);
            setStep("scan");
          },
        });
      },
    });
  }

  const handleScanComplete = useCallback(() => {
    setShowRevealLayer(true);
    setScanExit(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealEnter(true));
    });

    window.setTimeout(() => {
      setShowScanLayer(false);
      setStep("reveal");
    }, TRANSITION_MS);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.62 0.19 260 / 0.3), transparent)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hex-grid-corner opacity-20"
      />

      {step === "island" && (
        <StepIslandPicker
          onConfirm={handleConfirm}
          isConfirming={isConfirming}
        />
      )}

      {(showScanLayer || showRevealLayer) && (
        <div className="relative flex min-h-screen flex-1 flex-col">
          {showScanLayer && (
            <div
              className="absolute inset-0 z-10 flex flex-col will-change-[opacity,filter,transform]"
              style={{
                opacity: scanExit ? 0 : 1,
                filter: scanExit ? "blur(6px)" : "blur(0px)",
                transform: scanExit ? "scale(0.97)" : "scale(1)",
                pointerEvents: scanExit ? "none" : undefined,
                transition: `opacity ${TRANSITION_MS}ms ease-in, filter ${TRANSITION_MS}ms ease-in, transform ${TRANSITION_MS}ms ease-in`,
              }}
            >
              <StepGithubScan onComplete={handleScanComplete} />
            </div>
          )}

          {showRevealLayer && (
            <div
              className="relative flex min-h-screen flex-1 flex-col will-change-[opacity,transform]"
              style={{
                opacity: revealEnter ? 1 : 0,
                transform: revealEnter ? "translateY(0)" : "translateY(20px)",
                transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              <LevelReveal
                ctaLabel="Claim your territory"
                onDone={() => {
                  setFromOnboarding(true);
                  router.push("/");
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
