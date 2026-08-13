export async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const mime = res.headers.get("content-type") ?? "image/jpeg"
    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`
  } catch {
    return null
  }
}
