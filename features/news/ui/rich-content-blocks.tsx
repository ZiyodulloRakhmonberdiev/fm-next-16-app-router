"use client"

import Link from "next/link"
import type { RichContentBlock } from "@/features/news/model"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"

export type RichContentBlocksProps = {
  blocks: RichContentBlock[]
}

export function RichContentBlocks({ blocks }: RichContentBlocksProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: RichContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="leading-7 not-first:mt-4">{block.text}</p>
    case "image":
      return (
        <figure className="my-4 w-full">
          <img
            src={block.src}
            alt={block.alt ?? ""}
            className="block w-full h-auto rounded-lg"
          />
        </figure>
      )
    case "video": {
      const embedUrl =
        block.source === "youtube" ? getYoutubeEmbedUrl(block.url) : null
      return (
        <div className="my-4 mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-muted">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Video"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={block.url}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="h-full w-full object-cover"
              poster={block.poster}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )
    }
    case "quote":
      return (
        <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground">
          <p>{block.text}</p>
          {block.author != null && block.author !== "" && (
            <cite className="mt-2 block not-italic">— {block.author}</cite>
          )}
        </blockquote>
      )
    case "link":
      return (
        <p>
          <Link
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {block.text}
          </Link>
        </p>
      )
    case "youtube": {
      const embedUrl = getYoutubeEmbedUrl(block.url)
      if (!embedUrl) return null
      return (
        <div className="my-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <iframe
            src={embedUrl}
            title="YouTube"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    default:
      return null
  }
}
