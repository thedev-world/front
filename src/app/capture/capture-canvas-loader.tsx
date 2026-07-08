"use client"

import dynamic from "next/dynamic"

const CaptureCanvas = dynamic(
  () => import("@/features/capture/components/capture-canvas").then((m) => ({ default: m.CaptureCanvas })),
  { ssr: false },
)

export function CaptureCanvasLoader({ targetLogin }: { targetLogin: string }) {
  return <CaptureCanvas targetLogin={targetLogin} />
}
