/**
 * Custom loader: Next.js talab qiladi — qaytarilgan URL ichida `width` ishtirok etsin
 * (https://nextjs.org/docs/messages/next-image-missing-loader-width).
 * Statik `/public` va ko‘p CDN URL’lar uchun `?w=` query brauzerda e’tiborsiz qoladi;
 * asl fayl o‘sha manzildan yuklanadi.
 */
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
