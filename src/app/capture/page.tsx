import { CaptureCanvasLoader } from "./capture-canvas-loader"

type Props = {
  searchParams: Promise<{ user?: string }>
}

export default async function CapturePage({ searchParams }: Props) {
  const { user } = await searchParams

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {user && <CaptureCanvasLoader targetLogin={user} />}
    </div>
  )
}
