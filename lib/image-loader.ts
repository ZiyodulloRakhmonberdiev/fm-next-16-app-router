export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const params = new URLSearchParams()
  params.set("w", String(width))
  if (quality != null) params.set("q", String(quality))
  const qs = params.toString()
  const sep = src.includes("?") ? "&" : "?"
  return `${src}${sep}${qs}`
}
