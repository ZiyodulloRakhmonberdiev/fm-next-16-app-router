const DEFAULT_MAX_LENGTH = 75

/** Belgilar soni bo‘yicha qisqartirish (so‘z chegarasiz). */
export function truncateChars(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "…"
}

export function truncate(text: string, maxLength = DEFAULT_MAX_LENGTH): string {
  if (!text || text.length <= maxLength) return text
  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice
  return cut + "..."
}

export type TruncateParts = {
  visible: string
  isTruncated: boolean
}

export function getTruncateParts(
  text: string,
  maxLength = DEFAULT_MAX_LENGTH
): TruncateParts {
  if (!text || text.length <= maxLength)
    return { visible: text, isTruncated: false }
  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  const visible = lastSpace > 0 ? slice.slice(0, lastSpace) : slice
  return { visible, isTruncated: true }
}