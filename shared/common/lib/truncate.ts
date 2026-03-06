export function truncate(text: string, maxLength = 156): string {
  if (!text || text.length <= maxLength) return text
  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice
  return cut + "..."
}