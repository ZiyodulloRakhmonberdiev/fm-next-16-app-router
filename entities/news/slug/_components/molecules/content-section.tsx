"use client"

import { isRichContent, parseRichContentString } from "@/features/news/model"
import type { NewsItem } from "@/features/news/model"
import { RichContentBlocks } from "@/features/news/ui/rich-content-blocks"
import { TextContentRenderer } from "@/features/news/ui/text-content-renderer"

type ContentSectionProps = {
  content: NewsItem["content"]
}

export function ContentSection({ content }: ContentSectionProps) {
  if (content == null || content === "") return null

  const parsedRichFromString =
    typeof content === "string" ? parseRichContentString(content) : null

  if (isRichContent(content)) {
    return <RichContentBlocks blocks={content} />
  }

  if (parsedRichFromString) {
    return <RichContentBlocks blocks={parsedRichFromString} />
  }

  if (typeof content === "string") {
    return <TextContentRenderer content={content} />
  }

  return null
}
