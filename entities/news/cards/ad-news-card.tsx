"use client"

import { Link } from "@/i18n/navigation"
import { Play } from "lucide-react"
import type { NewsItem } from "@/features/news/model"
import { VideoCardMediaPreview } from "@/features/news/ui/news-listing/video-card-media-preview"
import { cn } from "@/shared/common/lib/utils"

export type AdNewsCardProps = {
  item: NewsItem
  className?: string
  as?: "li" | "div"
}

const cardClassName =
  "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md text-left transition-[box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-md:bg-transparent max-md:hover:bg-white/5 md:bg-muted/50 md:hover:bg-muted/40 md:hover:shadow-md dark:md:bg-muted/25"

export function AdNewsCard({ item, className, as = "li" }: AdNewsCardProps) {
  const hasVideo = Boolean(item.videoUrl?.trim())

  const card = (
    <Link href={`/news/${item.slug}`} className={cn(cardClassName, className)}>
      <div
        className={cn(
          "order-1 flex min-h-0 flex-1 flex-col gap-3 px-0 py-3 text-white md:order-2 md:px-4 md:py-4",
          "bg-transparent md:bg-linear-to-b from-brand to-brand/70 md:dark:from-brand/70 md:dark:to-brand/20 md:text-white"
        )}
      >
        <h3 className="line-clamp-4 cursor-pointer text-[15px] font-bold leading-snug tracking-tight text-white transition-colors hover:text-white/90 md:text-base md:hover:text-white/90">
          {item.title}
        </h3>
      </div>

      <div className="relative order-2 aspect-video w-full shrink-0 cursor-pointer overflow-hidden rounded-sm bg-muted md:order-1 md:rounded-none">
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
    </Link>
  )

  return as === "div" ? <div className="flex h-full min-w-0">{card}</div> : <li className="flex h-full min-w-0">{card}</li>
}

export default AdNewsCard
