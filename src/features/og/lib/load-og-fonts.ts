import fs from "node:fs"
import path from "node:path"

type OgFont = {
  name: string
  data: Buffer
  weight: 400 | 700
  style: "normal"
}

export function loadOgFonts(cwd = process.cwd()): OgFont[] {
  return [
    {
      name: "Geist",
      data: fs.readFileSync(
        path.join(cwd, "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"),
      ),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist",
      data: fs.readFileSync(path.join(cwd, "public/fonts/Geist-Bold.ttf")),
      weight: 700,
      style: "normal",
    },
  ]
}
