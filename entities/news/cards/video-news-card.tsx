"use client"

import { Link } from "@/i18n/navigation"
import { Play } from "lucide-react"
import type { NewsItem } from "@/features/news/model"
import { VideoCardMediaPreview } from "@/features/news/ui/news-listing/video-card-media-preview"
import { CategoryName } from "@/entities/news/_components/atoms/category-name"
import { PublishedAt } from "@/entities/news/_components/atoms/published-at"
import { cn } from "@/shared/common/lib/utils"

export type VideoNewsCardProps = {
  item: NewsItem
  onOpenVideo?: (item: NewsItem) => void
  showCategory?: boolean
  showPublishedAt?: boolean
  categoryLabel?: string
  className?: string
  as?: "li" | "div"
}

const cardClassName =
  "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md bg-muted/50 text-left ring-1 ring-border/60 transition-[box-shadow,transform] duration-200 hover:bg-muted/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-muted/25"

export function VideoNewsCard({
  item,
  onOpenVideo,
  showCategory = false,
  showPublishedAt = false,
  categoryLabel,
  className,
  as = "li",
}: VideoNewsCardProps) {
  const hasVideo = Boolean(item.videoUrl?.trim())
  const canOpenVideo = hasVideo && Boolean(onOpenVideo)
  const label = categoryLabel?.trim() || item.category || item.categorySlug

  const body = (
    <>
      <div className="relative aspect-video w-full shrink-0 cursor-pointer overflow-hidden bg-muted group">
        <VideoCardMediaPreview title={item.title} item={item} />
        {hasVideo ? (
          <span
            className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-foreground shadow-md ring-black/5"
            aria-hidden
          >
            <Play className="size-4 fill-current text-white" />
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 bg-brand/5 p-4 dark:bg-card">
        <h3 className="line-clamp-4 cursor-pointer text-[15px] font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-brand md:text-base">
          {item.title}
        </h3>

        {showCategory || showPublishedAt ? (
          <div className="mt-auto flex min-w-0 items-center gap-1 text-[11px] leading-relaxed text-muted-foreground md:text-xs">
            {showCategory ? (
              <CategoryName
                categorySlug={item.categorySlug}
                categoryLabel={label}
                hasVideo={false}
                className="shrink-0"
              />
            ) : null}
            {showCategory && showPublishedAt ? (
              <span className="mx-1.5 shrink-0 text-muted-foreground/40" aria-hidden>
                |
              </span>
            ) : null}
            {showPublishedAt ? (
              <PublishedAt publishedAt={item.publishedAt} className="shrink-0" hasCalendar={false} />
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )

  const card = canOpenVideo ? (
    <button type="button" className={cn(cardClassName, className)} onClick={() => onOpenVideo?.(item)}>
      {body}
    </button>
  ) : (
    <Link href={`/news/${item.slug}`} className={cn(cardClassName, className)}>
      {body}
    </Link>
  )

  return as === "div" ? <div className="flex h-full min-w-0">{card}</div> : <li className="flex h-full min-w-0">{card}</li>
}

export default VideoNewsCard
