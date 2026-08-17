import fs from "node:fs"
import path from "node:path"

import sharp from "sharp"

export async function loadAppleIconSrc(size = 36): Promise<string | null> {
  const logoPath = path.join(process.cwd(), "src/app/apple-icon.png")
  if (!fs.existsSync(logoPath)) return null

  const buf = await sharp(logoPath)
    .resize(size, size)
    .jpeg({ quality: 90 })
    .toBuffer()
    .catch(() => null)

  return buf ? `data:image/jpeg;base64,${buf.toString("base64")}` : null
}
