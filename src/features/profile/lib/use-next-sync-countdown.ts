"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownState = { countdown: string; isReady: boolean };

function computeCountdown(nextSyncAt: string): CountdownState {
  const remaining = new Date(nextSyncAt).getTime() - Date.now();

  if (remaining <= 0) return { countdown: "", isReady: true };

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return { countdown: `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`, isReady: false };
  if (m > 0) return { countdown: `${m}m ${String(s).padStart(2, "0")}s`, isReady: false };
  return { countdown: `${s}s`, isReady: false };
}

export function useNextSyncCountdown(nextSyncAt: string | null): CountdownState {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [nextSyncAt]);

   
  return useMemo(
    () => (nextSyncAt ? computeCountdown(nextSyncAt) : { countdown: "", isReady: true }),
    [nextSyncAt, tick],
  );
}
