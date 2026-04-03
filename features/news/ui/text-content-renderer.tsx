"use client"

import { RichTextContent } from "@/features/news/lib/rich-text-renderer"

type TextContentRendererProps = {
  content: string
}

export function TextContentRenderer({ content }: TextContentRendererProps) {
  return <RichTextContent content={content} className="prose prose-neutral dark:prose-invert max-w-none" />
}
