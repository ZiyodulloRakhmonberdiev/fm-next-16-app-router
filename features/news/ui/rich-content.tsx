"use client"

import * as React from "react"
import Image from "next/image"
import type { RichContentBlock } from "@/features/news/model/content"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"

type RichContentProps = {
  blocks: RichContentBlock[]
}

export function RichContent({ blocks }: RichContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {blocks.map((block, i) => (
        <React.Fragment key={i}>
          {block.type === "paragraph" && (
            <p className="mb-4 leading-relaxed">{block.text}</p>
          )}
          {block.type === "image" && (
            <figure className="my-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={block.src}
                  alt={block.alt ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              {block.alt && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          )}
          {block.type === "video" && (
            <div className="my-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {(() => {
                const source = block.source ?? (("src" in block && block.src) ? "local" : "local")
                const url = block.url ?? ("src" in block ? (block as { src: string }).src : "")
                if (!url) return null
                if (source === "youtube") {
                  const embedUrl = getYoutubeEmbedUrl(url)
                  if (!embedUrl) return null
                  return (
                    <iframe
                      src={embedUrl}
                      title="YouTube video"
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                return (
                  <video
                    src={url}
                    poster={block.poster}
                    controls
                    className="h-full w-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              })()}
            </div>
          )}
          {/* Eski format: type "youtube" (backward compat) */}
          {"type" in block && block.type === "youtube" && "url" in block && (
            <div className="my-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {(() => {
                const embedUrl = getYoutubeEmbedUrl((block as { url: string }).url)
                if (!embedUrl) return null
                return (
                  <iframe
                    src={embedUrl}
                    title="YouTube video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              })()}
            </div>
          )}
          {block.type === "quote" && (
            <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
              <p className="mb-1">"{block.text}"</p>
              {block.author && (
                <cite className="text-sm not-italic">— {block.author}</cite>
              )}
            </blockquote>
          )}
          {block.type === "link" && (
            <p className="mb-4">
              <a
                href={block.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                {block.text}
              </a>
            </p>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
