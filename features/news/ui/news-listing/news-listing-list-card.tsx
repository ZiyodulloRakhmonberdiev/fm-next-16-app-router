"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Eye, MessageSquare, Play } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Card } from "@/shared/common/components/ui/card"
import type { NewsItem } from "@/features/news/model"
import { getSafeImageSrc, getVideoPoster } from "./news-listing-utils"

type NewsListingListCardProps = {
  item: NewsItem
  locale: AppLocale
  stats?: { comments: number; reactions: number }
  imagesLabel: string
}

export function NewsListingListCard({ item, locale, stats, imagesLabel }: NewsListingListCardProps) {
  const thumbSrc = getSafeImageSrc(item.images?.[0])
  const videoPoster = !thumbSrc ? getSafeImageSrc(getVideoPoster(item.videoUrl)) : ""
  const showVideo = !thumbSrc && Boolean(item.videoUrl?.trim())
  const mediaSrc = thumbSrc || videoPoster

  return (
    <Link href={`/news/${item.slug}`} className="group block">
      <Card className="gap-0 overflow-hidden rounded-lg p-0 py-0 shadow-none transition-colors hover:bg-muted/30">
        <div className="flex flex-col gap-3 p-0 sm:flex-row">
          <div className="relative h-44 w-full overflow-hidden rounded-md bg-muted sm:h-48 sm:basis-1/3">
            {mediaSrc ? (
              <Image
                src={mediaSrc}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                {imagesLabel}
              </div>
            )}
            {showVideo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-black/50">
                  <Play className="h-5 w-5 text-white" />
                </span>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex flex-1 flex-col justify-between space-y-2 p-2 sm:basis-2/3 md:p-4">
            <div className="flex flex-wrap items-center text-[11px] text-muted-foreground">
              <span className="font-medium text-brand italic uppercase">{item.category}</span>
            </div>

            <div className="text-sm font-semibold leading-snug">
              <span className="line-clamp-2">{item.title ?? ""}</span>
            </div>

            {item.description ? (
              <div className="min-w-0">
                <p className="line-clamp-3 wrap-break-word text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={formatDateISO(item.publishedAt)} className="inline-flex items-center gap-1">
                {formatDateTimeLocale(item.publishedAt, locale)}
              </time>
              <span aria-hidden className="select-none">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {item.views}
              </span>
              <span aria-hidden className="select-none">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {stats?.comments ?? 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
