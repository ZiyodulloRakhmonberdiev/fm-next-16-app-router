export type RichContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string }
  | {
      type: "video"
      source: "local" | "youtube"
      url: string
      poster?: string
    }
  | { type: "quote"; text: string; author?: string }
  | { type: "link"; href: string; text: string }
  /** @deprecated video blokida source: "youtube" va url ishlatiladi */
  | { type: "youtube"; url: string }

export type NewsContent = string | RichContentBlock[]

export function isRichContent(
  content: NewsContent
): content is RichContentBlock[] {
  return Array.isArray(content) && content.length >= 0
}

export function parseRichContentString(value: string): RichContentBlock[] | null {
  const text = value.trim()
  if (!text.startsWith("[") || !text.endsWith("]")) return null

  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) return null
    const allObjects = parsed.every(
      (item) =>
        item != null &&
        typeof item === "object" &&
        "type" in (item as Record<string, unknown>) &&
        typeof (item as Record<string, unknown>).type === "string"
    )
    return allObjects ? (parsed as RichContentBlock[]) : null
  } catch {
    return null
  }
}
