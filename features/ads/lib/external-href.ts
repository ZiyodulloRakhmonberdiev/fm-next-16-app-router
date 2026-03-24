/**
 * Ensures ad / outbound URLs open as absolute locations in a new tab.
 * Values like "fm.uz" would otherwise resolve as site-relative (e.g. /fm.uz on localhost).
 */
export function toAbsoluteExternalHref(
  raw: string | undefined | null
): string | undefined {
  if (raw == null) return undefined
  const t = raw.trim()
  if (!t) return undefined
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith("//")) return `https:${t}`
  if (/^(mailto|tel|sms):/i.test(t)) return t
  return `https://${t.replace(/^\/+/, "")}`
}
