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
