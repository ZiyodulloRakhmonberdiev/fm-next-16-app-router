/**
 * NEXT_PUBLIC_API_URL (VPS/media server) dan foydalanib media URL ni qaytaradi.
 * Agar url absolyut (http/https) bo'lsa — o'zgartirilmaydi.
 * Agar nisbiy (/uploads/...) bo'lsa — NEXT_PUBLIC_API_URL qo'shiladi (.env.local da belgilang).
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (!url?.trim()) return ""
  const u = url.trim()
  if (u.startsWith("http://") || u.startsWith("https://")) return u
  const base = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || ""
  const baseClean = base.replace(/\/$/, "")
  if (!baseClean) return u
  return baseClean + (u.startsWith("/") ? u : `/${u}`)
}
