"use client";

import { useState } from "react";
import { StepIslandPicker } from "./step-island-picker";
import { LevelReveal } from "./level-reveal";
import { useUpdateIsland } from "../api/use-update-island";
import { useCompleteOnboarding } from "../api/use-complete-onboarding";

type Step = "island" | "reveal";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("island");
  const { mutate: updateIsland, isPending: isUpdatingIsland } =
    useUpdateIsland();
  const { mutate: completeOnboarding, isPending: isCompletingOnboarding } =
    useCompleteOnboarding();

  const isConfirming = isUpdatingIsland || isCompletingOnboarding;

  function handleConfirm(island: string) {
    updateIsland(island, {
      onSuccess: () => {
        completeOnboarding(undefined, {
          onSuccess: () => setStep("reveal"),
        });
      },
    });
  }

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
      {step === "reveal" && <LevelReveal />}
    </div>
  );
}
