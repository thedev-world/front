"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useSyncReveal } from "../lib/sync-reveal-context";
import { LevelReveal } from "@/features/onboarding/components/level-reveal";

export function SyncRevealDialog() {
  const { pendingProgress, clearProgress } = useSyncReveal();

  const isOpen = pendingProgress !== null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) clearProgress(); }} modal>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          style={{ animation: isOpen ? "reveal-in 0.3s ease both" : undefined }}
        />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto"
          aria-label="XP sync result"
        >
          {pendingProgress && (
            <LevelReveal
              startXp={pendingProgress.xp_before}
              endXp={pendingProgress.xp_after}
              onDone={clearProgress}
              ctaLabel="Continue"
              diffSummary={{
                xpGained: pendingProgress.xp_after - pendingProgress.xp_before,
                levelBefore: pendingProgress.level_before,
                levelAfter: pendingProgress.level_after,
                cellBefore: pendingProgress.cell_before,
                cellAfter: pendingProgress.cell_after,
              }}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
