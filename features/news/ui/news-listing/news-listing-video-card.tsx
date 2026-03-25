"use client"

import { Link } from "@/i18n/navigation"
import { Play } from "lucide-react"
import { formatDateISO } from "@/shared/common/lib/formatter"
import type { NewsItem } from "@/features/news/model"
import { formatVideoCardMetaLine } from "./news-listing-utils"
import { VideoCardMediaPreview } from "./video-card-media-preview"

type NewsListingVideoCardProps = {
  item: NewsItem
  categoryLabel: string
  onOpenVideo?: (item: NewsItem) => void
}

export function NewsListingVideoCard({
  item,
  categoryLabel,
  onOpenVideo,
}: NewsListingVideoCardProps) {
  const metaLine = formatVideoCardMetaLine(item.publishedAt)
  const canOpenVideo = Boolean(item.videoSource && item.videoUrl && onOpenVideo)

  const body = (
    <>
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
        <VideoCardMediaPreview title={item.title} item={item} />
        <span
          className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-foreground shadow-md ring-1 ring-black/5"
          aria-hidden
        >
          <Play className="size-4 fill-current text-white" />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 bg-accent/50">
        <h3 className="line-clamp-4 text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-base">
          {item.title}
        </h3>
        <div className="mt-auto flex items-center gap-1 text-[11px] leading-relaxed text-muted-foreground md:text-xs">
          <span className="line-clamp-1">{categoryLabel}</span>
          <span className="mx-1.5 text-muted-foreground/40" aria-hidden>
            |
          </span>
          <time dateTime={formatDateISO(item.publishedAt)}>{metaLine}</time>
        </div>
      </div>
    </>
  )

  const interactiveClassName =
    "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md bg-muted/50 text-left ring-1 ring-border/60 transition-[box-shadow,transform] duration-200 hover:bg-muted/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-muted/25"

  if (canOpenVideo) {
    return (
      <li className="flex h-full min-w-0">
        <button
          type="button"
          className={interactiveClassName}
          onClick={() => onOpenVideo!(item)}
        >
          {body}
        </button>
      </li>
    )
  }

  return (
    <li className="flex h-full min-w-0">
      <Link href={`/news/${item.slug}`} className={interactiveClassName}>
        {body}
      </Link>
    </li>
  )
}
